import type {
  AlertSeverity,
  Prisma,
  RiskLevel,
  RiskRule,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { riskRuleSchema, type RiskRuleInput } from "@/lib/validators";
import { createAuditLog } from "@/server/services/audit-service";
import { createPageResult } from "@/server/services/common";

type RecordSnapshot = {
  id: string;
  period: string;
  attendancePercent: number;
  averageGrade: number;
  pendingAssignments: number;
  totalAssignments: number;
  student: {
    id: string;
    name: string;
    course: {
      unitId: string;
    };
  };
};

type RiskComputation = {
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
  severity: AlertSeverity | null;
};

export function calculateRisk(
  record: Pick<
    RecordSnapshot,
    "attendancePercent" | "averageGrade" | "pendingAssignments" | "totalAssignments"
  >,
  rule: Pick<
    RiskRule,
    | "highRiskAttendanceThreshold"
    | "mediumRiskAttendanceThreshold"
    | "highRiskGradeThreshold"
    | "mediumRiskGradeThreshold"
    | "highRiskPendingAssignmentsThreshold"
    | "mediumRiskPendingAssignmentsThreshold"
    | "attendanceWeight"
    | "gradeWeight"
    | "assignmentsWeight"
  >,
): RiskComputation {
  const reasons: string[] = [];
  let riskLevel: RiskLevel = "LOW";

  if (record.attendancePercent < rule.highRiskAttendanceThreshold) {
    reasons.push("Frequencia abaixo do limite critico.");
    riskLevel = "HIGH";
  }

  if (record.averageGrade < rule.highRiskGradeThreshold) {
    reasons.push("Nota media abaixo do limite critico.");
    riskLevel = "HIGH";
  }

  if (record.pendingAssignments >= rule.highRiskPendingAssignmentsThreshold) {
    reasons.push("Pendencias acima do limite critico.");
    riskLevel = "HIGH";
  }

  if (riskLevel !== "HIGH") {
    if (record.attendancePercent < rule.mediumRiskAttendanceThreshold) {
      reasons.push("Frequencia abaixo do limite de atencao.");
      riskLevel = "MEDIUM";
    }

    if (record.averageGrade < rule.mediumRiskGradeThreshold) {
      reasons.push("Nota media abaixo do limite de atencao.");
      riskLevel = "MEDIUM";
    }

    if (record.pendingAssignments >= rule.mediumRiskPendingAssignmentsThreshold) {
      reasons.push("Pendencias em faixa de atencao.");
      riskLevel = "MEDIUM";
    }
  }

  const attendanceRisk =
    Math.max(0, 100 - record.attendancePercent) * rule.attendanceWeight;
  const gradeRisk = Math.max(0, 10 - record.averageGrade) * 10 * rule.gradeWeight;
  const assignmentRisk =
    (record.totalAssignments > 0
      ? (record.pendingAssignments / record.totalAssignments) * 100
      : record.pendingAssignments * 10) * rule.assignmentsWeight;

  const score = Number((attendanceRisk + gradeRisk + assignmentRisk).toFixed(2));

  return {
    riskLevel,
    score,
    reasons: reasons.length > 0 ? reasons : ["Indicadores dentro da faixa esperada."],
    severity:
      riskLevel === "HIGH" ? "CRITICAL" : riskLevel === "MEDIUM" ? "ATTENTION" : null,
  };
}

async function ensureFollowUpCase(
  tx: Prisma.TransactionClient,
  studentId: string,
  period: string,
) {
  const existing = await tx.followUpCase.findFirst({
    where: {
      studentId,
      period,
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
    },
    orderBy: {
      openedAt: "desc",
    },
  });

  if (existing) {
    return existing;
  }

  return tx.followUpCase.create({
    data: {
      studentId,
      period,
      status: "PENDING",
    },
  });
}

async function upsertAlertForAssessment(
  tx: Prisma.TransactionClient,
  input: {
    studentId: string;
    period: string;
    riskAssessmentId: string;
    severity: AlertSeverity;
    title: string;
    description: string;
  },
) {
  const openAlerts = await tx.alert.findMany({
    where: {
      studentId: input.studentId,
      severity: input.severity,
      status: "OPEN",
    },
    include: {
      riskAssessment: {
        include: {
          academicRecord: true,
        },
      },
    },
  });

  const matchingAlert = openAlerts.find(
    (alert) => alert.riskAssessment.academicRecord.period === input.period,
  );

  const followUpCase = await ensureFollowUpCase(tx, input.studentId, input.period);

  if (matchingAlert) {
    return tx.alert.update({
      where: { id: matchingAlert.id },
      data: {
        title: input.title,
        description: input.description,
        riskAssessmentId: input.riskAssessmentId,
        followUpCaseId: followUpCase.id,
        generatedAt: new Date(),
      },
    });
  }

  return tx.alert.create({
    data: {
      studentId: input.studentId,
      riskAssessmentId: input.riskAssessmentId,
      followUpCaseId: followUpCase.id,
      severity: input.severity,
      title: input.title,
      description: input.description,
      status: "OPEN",
    },
  });
}

export async function listRiskRules(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const [items, total] = await Promise.all([
    prisma.riskRule.findMany({
      include: {
        unit: true,
        createdBy: true,
        _count: { select: { riskAssessments: true } },
      },
      orderBy: [{ active: "desc" }, { period: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.riskRule.count(),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function saveRiskRule(
  input: RiskRuleInput & { id?: string; createdById?: string },
  actorId?: string,
) {
  const parsed = riskRuleSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    if (parsed.active) {
      await tx.riskRule.updateMany({
        where: {
          unitId: parsed.unitId,
          period: parsed.period,
          NOT: input.id ? { id: input.id } : undefined,
        },
        data: { active: false },
      });
    }

    return input.id
      ? tx.riskRule.update({
          where: { id: input.id },
          data: parsed,
        })
      : tx.riskRule.create({
          data: {
            ...parsed,
            createdById: input.createdById ?? actorId,
          },
        });
  });

  await createAuditLog({
    userId: actorId,
    action: input.id ? "RISK_RULE_UPDATED" : "RISK_RULE_CREATED",
    entity: "RiskRule",
    entityId: result.id,
    metadata: {
      unitId: result.unitId,
      period: result.period,
      active: result.active,
    },
  });

  return result;
}

export async function assessAcademicRecord(recordId: string, actorId?: string) {
  const record = await prisma.academicRecord.findUnique({
    where: { id: recordId },
    include: {
      student: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!record) {
    throw new Error("Registro academico nao encontrado.");
  }

  const rule = await prisma.riskRule.findFirst({
    where: {
      unitId: record.student.course.unitId,
      period: record.period,
      active: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!rule) {
    return null;
  }

  const computed = calculateRisk(record, rule);

  const result = await prisma.$transaction(async (tx) => {
    const assessment = await tx.riskAssessment.create({
      data: {
        studentId: record.studentId,
        academicRecordId: record.id,
        riskRuleId: rule.id,
        riskLevel: computed.riskLevel,
        score: computed.score,
        reasons: computed.reasons,
      },
    });

    if (computed.severity) {
      await upsertAlertForAssessment(tx, {
        studentId: record.studentId,
        period: record.period,
        riskAssessmentId: assessment.id,
        severity: computed.severity,
        title:
          computed.riskLevel === "HIGH"
            ? "Alerta critico de evasao"
            : "Alerta de atencao ao estudante",
        description: `${record.student.name}: ${computed.reasons.join(" ")}`,
      });
    }

    return assessment;
  });

  await createAuditLog({
    userId: actorId,
    action: "RISK_ASSESSED",
    entity: "RiskAssessment",
    entityId: result.id,
    metadata: {
      recordId,
      riskLevel: result.riskLevel,
    },
  });

  return result;
}

export async function reprocessRisk(unitId: string, period: string, actorId?: string) {
  const records = await prisma.academicRecord.findMany({
    where: {
      period,
      student: {
        course: {
          unitId,
        },
      },
    },
    select: { id: true },
  });

  const assessments = [];
  for (const record of records) {
    const assessment = await assessAcademicRecord(record.id, actorId);
    if (assessment) {
      assessments.push(assessment);
    }
  }

  return assessments;
}
