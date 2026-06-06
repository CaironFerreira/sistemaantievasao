import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  const [
    monitoredStudents,
    openAlerts,
    casesByStatus,
    latestAssessments,
    firstActions,
  ] = await Promise.all([
    prisma.student.count({ where: { active: true } }),
    prisma.alert.count({ where: { status: "OPEN" } }),
    prisma.followUpCase.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.riskAssessment.groupBy({
      by: ["riskLevel"],
      _count: true,
    }),
    prisma.intervention.findMany({
      select: {
        createdAt: true,
        followUpCase: {
          select: {
            alerts: {
              select: {
                generatedAt: true,
              },
              take: 1,
              orderBy: { generatedAt: "asc" },
            },
          },
        },
      },
    }),
  ]);

  const responseTimeHours =
    firstActions.length > 0
      ? Number(
          (
            firstActions.reduce((accumulator, intervention) => {
              const alert = intervention.followUpCase.alerts[0];
              if (!alert) {
                return accumulator;
              }

              const diff =
                intervention.createdAt.getTime() - alert.generatedAt.getTime();
              return accumulator + diff / (1000 * 60 * 60);
            }, 0) / firstActions.length
          ).toFixed(1),
        )
      : 0;

  return {
    monitoredStudents,
    openAlerts,
    casesByStatus,
    latestAssessments,
    responseTimeHours,
  };
}

export async function getAggregateReports(filters: {
  unitId?: string;
  courseId?: string;
  classGroupId?: string;
  period?: string;
}) {
  const studentWhere = {
    ...(filters.courseId ? { courseId: filters.courseId } : {}),
    ...(filters.classGroupId ? { classGroupId: filters.classGroupId } : {}),
    ...(filters.unitId
      ? {
          course: {
            is: {
              unitId: filters.unitId,
            },
          },
        }
      : {}),
  };

  const assessmentWhere = {
    ...(filters.period
      ? {
          academicRecord: {
            is: {
              period: filters.period,
            },
          },
        }
      : {}),
    ...(filters.courseId || filters.classGroupId || filters.unitId
      ? {
          student: {
            is: studentWhere,
          },
        }
      : {}),
  };

  const [students, riskDistribution, cases, causes] = await Promise.all([
    prisma.student.count({
      where: studentWhere,
    }),
    prisma.riskAssessment.groupBy({
      by: ["riskLevel"],
      where: assessmentWhere,
      _count: true,
    }),
    prisma.followUpCase.groupBy({
      by: ["status"],
      where: {
        ...(filters.period ? { period: filters.period } : {}),
        ...(filters.courseId || filters.classGroupId || filters.unitId
          ? {
              student: {
                is: studentWhere,
              },
            }
          : {}),
      },
      _count: true,
    }),
    prisma.intervention.groupBy({
      by: ["causeCategoryId"],
      _count: true,
      where: {
        followUpCase: {
          is: {
            ...(filters.period ? { period: filters.period } : {}),
            ...(filters.courseId || filters.classGroupId || filters.unitId
              ? {
                  student: {
                    is: studentWhere,
                  },
                }
              : {}),
          },
        },
      },
    }),
  ]);

  const causeDefinitions = await prisma.causeCategory.findMany({
    where: {
      id: {
        in: causes.map((cause) => cause.causeCategoryId),
      },
    },
  });

  const causeMap = Object.fromEntries(
    causeDefinitions.map((cause) => [cause.id, cause.name]),
  );

  const interventions = await prisma.intervention.findMany({
    where: {
      followUpCase: {
        is: {
          ...(filters.period ? { period: filters.period } : {}),
          ...(filters.courseId || filters.classGroupId || filters.unitId
            ? {
                student: {
                  is: studentWhere,
                },
              }
            : {}),
        },
      },
    },
    include: {
      followUpCase: {
        include: {
          alerts: {
            orderBy: { generatedAt: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const averageHoursToFirstAction =
    interventions.length > 0
      ? Number(
          (
            interventions.reduce((total, intervention) => {
              const alert = intervention.followUpCase.alerts[0];
              if (!alert) {
                return total;
              }
              return (
                total +
                (intervention.createdAt.getTime() - alert.generatedAt.getTime()) /
                  (1000 * 60 * 60)
              );
            }, 0) / interventions.length
          ).toFixed(1),
        )
      : 0;

  const totalCases = cases.reduce((sum, item) => sum + item._count, 0);
  const completedCases = cases.find((item) => item.status === "COMPLETED")?._count ?? 0;
  const resolutionRate =
    totalCases > 0 ? Number(((completedCases / totalCases) * 100).toFixed(1)) : 0;

  return {
    students,
    riskDistribution,
    cases,
    averageHoursToFirstAction,
    resolutionRate,
    causes: causes.map((cause) => ({
      label: causeMap[cause.causeCategoryId] ?? "Nao informado",
      total: cause._count,
    })),
  };
}
