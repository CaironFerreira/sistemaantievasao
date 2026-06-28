import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  studentCount: vi.fn(),
  studentFindMany: vi.fn(),
  academicRecordUpdate: vi.fn(),
  academicRecordUpsert: vi.fn(),
  createAuditLog: vi.fn(),
  createPageResult: vi.fn(),
  assessAcademicRecord: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    student: {
      count: mocks.studentCount,
      findMany: mocks.studentFindMany,
    },
    academicRecord: {
      update: mocks.academicRecordUpdate,
      upsert: mocks.academicRecordUpsert,
    },
  },
}));

vi.mock("@/server/services/audit-service", () => ({
  createAuditLog: mocks.createAuditLog,
}));

vi.mock("@/server/services/common", () => ({
  createPageResult: mocks.createPageResult,
}));

vi.mock("@/server/services/risk-service", () => ({
  assessAcademicRecord: mocks.assessAcademicRecord,
}));

import { listStudents, saveAcademicRecord } from "@/server/services/student-service";

describe("student-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPageResult.mockImplementation(
      (items: unknown[], total: number, page: number, pageSize: number) => ({
        items,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      }),
    );
  });

  it("consulta o ultimo RiskAssessment dentro do ultimo AcademicRecord listado", async () => {
    mocks.studentFindMany.mockResolvedValue([]);
    mocks.studentCount.mockResolvedValue(0);

    await listStudents({ page: 1, pageSize: 10 });

    expect(mocks.studentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          academicRecords: {
            orderBy: [{ period: "desc" }, { updatedAt: "desc" }],
            take: 1,
            include: {
              riskAssessments: {
                orderBy: { assessedAt: "desc" },
                take: 1,
              },
            },
          },
        }),
      }),
    );

    expect(mocks.studentFindMany.mock.calls[0][0].include).not.toHaveProperty(
      "riskAssessments",
    );
  });

  it("salva o registro manual mesmo sem regra previa e dispara a avaliacao", async () => {
    mocks.academicRecordUpsert.mockResolvedValue({
      id: "record-1",
      studentId: "student-1",
      period: "2026.2",
      source: "MANUAL",
    });

    await saveAcademicRecord(
      {
        studentId: "student-1",
        period: "2026.2",
        attendancePercent: 40,
        averageGrade: 3.1,
        pendingAssignments: 10,
        totalAssignments: 10,
        source: "MANUAL",
      },
      "user-1",
    );

    expect(mocks.academicRecordUpsert).toHaveBeenCalledWith({
      where: {
        studentId_period: {
          studentId: "student-1",
          period: "2026.2",
        },
      },
      create: {
        studentId: "student-1",
        period: "2026.2",
        attendancePercent: 40,
        averageGrade: 3.1,
        pendingAssignments: 10,
        totalAssignments: 10,
        source: "MANUAL",
      },
      update: {
        studentId: "student-1",
        period: "2026.2",
        attendancePercent: 40,
        averageGrade: 3.1,
        pendingAssignments: 10,
        totalAssignments: 10,
        source: "MANUAL",
      },
    });
    expect(mocks.assessAcademicRecord).toHaveBeenCalledWith("record-1", "user-1");
    expect(mocks.createAuditLog).toHaveBeenCalledWith({
      userId: "user-1",
      action: "ACADEMIC_RECORD_CREATED",
      entity: "AcademicRecord",
      entityId: "record-1",
      metadata: {
        studentId: "student-1",
        period: "2026.2",
        source: "MANUAL",
      },
    });
  });
});
