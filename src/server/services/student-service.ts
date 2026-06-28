import { prisma } from "@/lib/prisma";
import {
  academicRecordSchema,
  studentSchema,
  type AcademicRecordInput,
  type StudentInput,
} from "@/lib/validators";
import { createAuditLog } from "@/server/services/audit-service";
import { createPageResult } from "@/server/services/common";
import { assessAcademicRecord } from "@/server/services/risk-service";

export async function listStudents(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { enrollmentCode: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        course: { include: { unit: true } },
        classGroup: true,
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
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function saveStudent(input: StudentInput & { id?: string }, actorId?: string) {
  const parsed = studentSchema.parse(input);
  const result = input.id
    ? await prisma.student.update({
        where: { id: input.id },
        data: parsed,
      })
    : await prisma.student.create({
        data: parsed,
      });

  await createAuditLog({
    userId: actorId,
    action: input.id ? "STUDENT_UPDATED" : "STUDENT_CREATED",
    entity: "Student",
    entityId: result.id,
    metadata: {
      enrollmentCode: result.enrollmentCode,
      active: result.active,
    },
  });

  return result;
}

export async function saveAcademicRecord(
  input: AcademicRecordInput & { id?: string },
  actorId?: string,
) {
  const parsed = academicRecordSchema.parse(input);
  const result = input.id
    ? await prisma.academicRecord.update({
        where: { id: input.id },
        data: parsed,
      })
    : await prisma.academicRecord.upsert({
        where: {
          studentId_period: {
            studentId: parsed.studentId,
            period: parsed.period,
          },
        },
        create: parsed,
        update: parsed,
      });

  await assessAcademicRecord(result.id, actorId);

  await createAuditLog({
    userId: actorId,
    action: input.id ? "ACADEMIC_RECORD_UPDATED" : "ACADEMIC_RECORD_CREATED",
    entity: "AcademicRecord",
    entityId: result.id,
    metadata: {
      studentId: result.studentId,
      period: result.period,
      source: result.source,
    },
  });

  return result;
}

export async function getStudentOptions() {
  return prisma.student.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      course: true,
      classGroup: true,
    },
  });
}

export async function getStudentReport(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      course: { include: { unit: true } },
      classGroup: true,
      academicRecords: {
        orderBy: [{ period: "desc" }, { updatedAt: "desc" }],
      },
      riskAssessments: {
        orderBy: { assessedAt: "desc" },
        include: { riskRule: true },
      },
      alerts: {
        orderBy: { generatedAt: "desc" },
        include: {
          followUpCase: true,
        },
      },
      followUpCases: {
        orderBy: { openedAt: "desc" },
        include: {
          interventions: {
            include: {
              causeCategory: true,
              createdBy: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}
