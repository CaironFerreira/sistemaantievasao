import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  riskRuleCount: vi.fn(),
  riskRuleCreate: vi.fn(),
  riskRuleFindFirst: vi.fn(),
  riskRuleFindMany: vi.fn(),
  riskRuleUpdate: vi.fn(),
  riskRuleUpdateMany: vi.fn(),
  academicRecordFindMany: vi.fn(),
  academicRecordFindUnique: vi.fn(),
  riskAssessmentCreate: vi.fn(),
  alertCreate: vi.fn(),
  alertFindMany: vi.fn(),
  alertUpdate: vi.fn(),
  followUpCaseCreate: vi.fn(),
  followUpCaseFindFirst: vi.fn(),
  prismaTransaction: vi.fn(),
  createAuditLog: vi.fn(),
  createPageResult: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    riskRule: {
      count: mocks.riskRuleCount,
      create: mocks.riskRuleCreate,
      findFirst: mocks.riskRuleFindFirst,
      findMany: mocks.riskRuleFindMany,
      update: mocks.riskRuleUpdate,
      updateMany: mocks.riskRuleUpdateMany,
    },
    academicRecord: {
      findMany: mocks.academicRecordFindMany,
      findUnique: mocks.academicRecordFindUnique,
    },
    $transaction: mocks.prismaTransaction,
  },
}));

vi.mock("@/server/services/audit-service", () => ({
  createAuditLog: mocks.createAuditLog,
}));

vi.mock("@/server/services/common", () => ({
  createPageResult: mocks.createPageResult,
}));

import {
  assessAcademicRecord,
  calculateRisk,
  ensureActiveRiskRuleForUnitPeriod,
} from "@/server/services/risk-service";

const baseRule = {
  highRiskAttendanceThreshold: 65,
  mediumRiskAttendanceThreshold: 80,
  highRiskGradeThreshold: 4,
  mediumRiskGradeThreshold: 6,
  highRiskPendingAssignmentsThreshold: 4,
  mediumRiskPendingAssignmentsThreshold: 2,
  attendanceWeight: 0.4,
  gradeWeight: 0.35,
  assignmentsWeight: 0.25,
};

describe("risk-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.alertFindMany.mockResolvedValue([]);
    mocks.followUpCaseFindFirst.mockResolvedValue(null);
    mocks.followUpCaseCreate.mockResolvedValue({ id: "case-1" });
    mocks.alertCreate.mockResolvedValue({ id: "alert-1" });
    mocks.prismaTransaction.mockImplementation(async (callback: unknown) =>
      (callback as (tx: {
        riskRule: {
          updateMany: typeof mocks.riskRuleUpdateMany;
          update: typeof mocks.riskRuleUpdate;
          create: typeof mocks.riskRuleCreate;
        };
        riskAssessment: {
          create: typeof mocks.riskAssessmentCreate;
        };
        alert: {
          findMany: typeof mocks.alertFindMany;
          update: typeof mocks.alertUpdate;
          create: typeof mocks.alertCreate;
        };
        followUpCase: {
          findFirst: typeof mocks.followUpCaseFindFirst;
          create: typeof mocks.followUpCaseCreate;
        };
      }) => Promise<unknown>)({
        riskRule: {
          updateMany: mocks.riskRuleUpdateMany,
          update: mocks.riskRuleUpdate,
          create: mocks.riskRuleCreate,
        },
        riskAssessment: {
          create: mocks.riskAssessmentCreate,
        },
        alert: {
          findMany: mocks.alertFindMany,
          update: mocks.alertUpdate,
          create: mocks.alertCreate,
        },
        followUpCase: {
          findFirst: mocks.followUpCaseFindFirst,
          create: mocks.followUpCaseCreate,
        },
      }),
    );
  });

  it("classifica alto risco em frequencia critica", () => {
    const result = calculateRisk(
      {
        attendancePercent: 55,
        averageGrade: 7,
        pendingAssignments: 1,
        totalAssignments: 8,
      },
      baseRule,
    );

    expect(result.riskLevel).toBe("HIGH");
    expect(result.severity).toBe("CRITICAL");
    expect(result.reasons).toContain("Frequencia abaixo do limite critico.");
  });

  it("classifica medio risco em indicador moderado", () => {
    const result = calculateRisk(
      {
        attendancePercent: 78,
        averageGrade: 6.5,
        pendingAssignments: 2,
        totalAssignments: 8,
      },
      baseRule,
    );

    expect(result.riskLevel).toBe("MEDIUM");
    expect(result.severity).toBe("ATTENTION");
  });

  it("classifica baixo risco sem sinais criticos", () => {
    const result = calculateRisk(
      {
        attendancePercent: 95,
        averageGrade: 8.7,
        pendingAssignments: 0,
        totalAssignments: 8,
      },
      baseRule,
    );

    expect(result.riskLevel).toBe("LOW");
    expect(result.severity).toBeNull();
    expect(result.reasons).toContain("Indicadores dentro da faixa esperada.");
  });

  it("cria uma regra padrao automaticamente quando nao existe regra ativa", async () => {
    mocks.riskRuleFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mocks.riskRuleCreate.mockResolvedValue({
      id: "rule-1",
      unitId: "unit-1",
      period: "2026.2",
      name: "Regra padrao 2026.2",
      active: true,
      ...baseRule,
    });

    const result = await ensureActiveRiskRuleForUnitPeriod("unit-1", "2026.2", "user-1");

    expect(mocks.riskRuleCreate).toHaveBeenCalledWith({
      data: {
        unitId: "unit-1",
        period: "2026.2",
        name: "Regra padrao 2026.2",
        active: true,
        createdById: "user-1",
        ...baseRule,
      },
    });
    expect(mocks.createAuditLog).toHaveBeenCalledWith({
      userId: "user-1",
      action: "RISK_RULE_AUTO_CREATED",
      entity: "RiskRule",
      entityId: "rule-1",
      metadata: {
        unitId: "unit-1",
        period: "2026.2",
        active: true,
      },
    });
    expect(result).toMatchObject({
      id: "rule-1",
      unitId: "unit-1",
      period: "2026.2",
      active: true,
    });
  });

  it("reativa a regra padrao existente quando ela ja foi criada para o periodo", async () => {
    mocks.riskRuleFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "rule-1",
        unitId: "unit-1",
        period: "2026.2",
        name: "Regra padrao 2026.2",
        active: false,
      });
    mocks.riskRuleUpdate.mockResolvedValue({
      id: "rule-1",
      unitId: "unit-1",
      period: "2026.2",
      name: "Regra padrao 2026.2",
      active: true,
    });

    const result = await ensureActiveRiskRuleForUnitPeriod("unit-1", "2026.2", "user-1");

    expect(mocks.riskRuleUpdate).toHaveBeenCalledWith({
      where: { id: "rule-1" },
      data: { active: true },
    });
    expect(mocks.riskRuleCreate).not.toHaveBeenCalled();
    expect(mocks.createAuditLog).toHaveBeenCalledWith({
      userId: "user-1",
      action: "RISK_RULE_AUTO_ACTIVATED",
      entity: "RiskRule",
      entityId: "rule-1",
      metadata: {
        unitId: "unit-1",
        period: "2026.2",
        active: true,
      },
    });
    expect(result).toMatchObject({
      id: "rule-1",
      active: true,
    });
  });

  it("avalia o registro manual imediatamente e gera alerta e caso quando o risco e alto", async () => {
    mocks.academicRecordFindUnique.mockResolvedValue({
      id: "record-1",
      studentId: "student-1",
      period: "2026.2",
      attendancePercent: 40,
      averageGrade: 3.1,
      pendingAssignments: 10,
      totalAssignments: 10,
      student: {
        id: "student-1",
        name: "Cicero",
        course: {
          unitId: "unit-1",
        },
      },
    });
    mocks.riskRuleFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mocks.riskRuleCreate.mockResolvedValue({
      id: "rule-1",
      unitId: "unit-1",
      period: "2026.2",
      name: "Regra padrao 2026.2",
      active: true,
      ...baseRule,
    });
    mocks.riskAssessmentCreate.mockResolvedValue({
      id: "assessment-1",
      riskLevel: "HIGH",
    });

    const result = await assessAcademicRecord("record-1", "user-1");

    expect(mocks.riskAssessmentCreate).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        academicRecordId: "record-1",
        riskRuleId: "rule-1",
        riskLevel: "HIGH",
        score: 73.15,
        reasons: [
          "Frequencia abaixo do limite critico.",
          "Nota media abaixo do limite critico.",
          "Pendencias acima do limite critico.",
        ],
      },
    });
    expect(mocks.followUpCaseCreate).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        period: "2026.2",
        status: "PENDING",
      },
    });
    expect(mocks.alertCreate).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        riskAssessmentId: "assessment-1",
        followUpCaseId: "case-1",
        severity: "CRITICAL",
        title: "Alerta critico de evasao",
        description:
          "Cicero: Frequencia abaixo do limite critico. Nota media abaixo do limite critico. Pendencias acima do limite critico.",
        status: "OPEN",
      },
    });
    expect(mocks.createAuditLog).toHaveBeenCalledWith({
      userId: "user-1",
      action: "RISK_ASSESSED",
      entity: "RiskAssessment",
      entityId: "assessment-1",
      metadata: {
        recordId: "record-1",
        riskLevel: "HIGH",
      },
    });
    expect(result).toEqual({
      id: "assessment-1",
      riskLevel: "HIGH",
    });
  });
});
