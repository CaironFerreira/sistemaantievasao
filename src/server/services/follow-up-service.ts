import { prisma } from "@/lib/prisma";
import { followUpActionSchema, type FollowUpActionInput } from "@/lib/validators";
import { createAuditLog } from "@/server/services/audit-service";
import { createPageResult } from "@/server/services/common";

export async function listAlerts(params: {
  page?: number;
  pageSize?: number;
  severity?: string;
  status?: string;
  period?: string;
  courseId?: string;
  classGroupId?: string;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const where = {
    ...(params.severity ? { severity: params.severity as "CRITICAL" | "ATTENTION" | "INFO" } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.courseId || params.classGroupId
      ? {
          student: {
            is: {
              ...(params.courseId ? { courseId: params.courseId } : {}),
              ...(params.classGroupId ? { classGroupId: params.classGroupId } : {}),
            },
          },
        }
      : {}),
    ...(params.period
      ? {
          riskAssessment: {
            is: {
              academicRecord: {
                is: {
                  period: params.period,
                },
              },
            },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: {
        student: {
          include: {
            course: true,
            classGroup: true,
          },
        },
        followUpCase: true,
        riskAssessment: {
          include: {
            academicRecord: true,
          },
        },
      },
      orderBy: [
        { severity: "asc" },
        { followUpCaseId: "asc" },
        { generatedAt: "asc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.alert.count({ where }),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function listCases(params: { page?: number; pageSize?: number; status?: string }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const where = params.status ? { status: params.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" } : {};

  const [items, total] = await Promise.all([
    prisma.followUpCase.findMany({
      where,
      include: {
        student: {
          include: {
            course: true,
            classGroup: true,
          },
        },
        alerts: {
          include: {
            riskAssessment: true,
          },
          orderBy: { generatedAt: "desc" },
        },
        interventions: {
          include: {
            causeCategory: true,
            createdBy: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ status: "asc" }, { openedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.followUpCase.count({ where }),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function getCaseDetails(id: string) {
  return prisma.followUpCase.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          course: { include: { unit: true } },
          classGroup: true,
          academicRecords: {
            orderBy: { period: "desc" },
            take: 3,
          },
        },
      },
      alerts: {
        include: {
          riskAssessment: {
            include: {
              riskRule: true,
              academicRecord: true,
            },
          },
        },
      },
      interventions: {
        include: {
          causeCategory: true,
          createdBy: true,
        },
        orderBy: { createdAt: "asc" },
      },
      assignedTo: true,
    },
  });
}

export async function addIntervention(input: FollowUpActionInput, actorId: string) {
  const parsed = followUpActionSchema.parse(input);

  const intervention = await prisma.$transaction(async (tx) => {
    const created = await tx.intervention.create({
      data: {
        caseId: parsed.caseId,
        causeCategoryId: parsed.causeCategoryId,
        actionTaken: parsed.actionTaken,
        notes: parsed.notes,
        createdById: actorId,
      },
    });

    const followUpCase = await tx.followUpCase.findUnique({
      where: { id: parsed.caseId },
    });

    if (followUpCase?.status === "PENDING") {
      await tx.followUpCase.update({
        where: { id: parsed.caseId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return created;
  });

  await createAuditLog({
    userId: actorId,
    action: "INTERVENTION_CREATED",
    entity: "Intervention",
    entityId: intervention.id,
    metadata: {
      caseId: parsed.caseId,
    },
  });

  return intervention;
}

export async function updateCaseStatus(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  actorId: string,
) {
  const updated = await prisma.followUpCase.update({
    where: { id },
    data: {
      status,
      closedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  await createAuditLog({
    userId: actorId,
    action: "CASE_STATUS_UPDATED",
    entity: "FollowUpCase",
    entityId: id,
    metadata: { status },
  });

  return updated;
}

export async function getCauseCategories() {
  return prisma.causeCategory.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
