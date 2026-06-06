import { prisma } from "@/lib/prisma";
import {
  classGroupSchema,
  courseSchema,
  institutionUnitSchema,
  type ClassGroupInput,
  type CourseInput,
  type InstitutionUnitInput,
} from "@/lib/validators";
import { createAuditLog } from "@/server/services/audit-service";
import { createPageResult } from "@/server/services/common";

export async function listUnits(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const [items, total] = await Promise.all([
    prisma.institutionUnit.findMany({
      include: {
        _count: { select: { courses: true, riskRules: true } },
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.institutionUnit.count(),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function saveUnit(input: InstitutionUnitInput & { id?: string }, actorId?: string) {
  const parsed = institutionUnitSchema.parse(input);
  const result = input.id
    ? await prisma.institutionUnit.update({
        where: { id: input.id },
        data: parsed,
      })
    : await prisma.institutionUnit.create({
        data: parsed,
      });

  await createAuditLog({
    userId: actorId,
    action: input.id ? "UNIT_UPDATED" : "UNIT_CREATED",
    entity: "InstitutionUnit",
    entityId: result.id,
    metadata: { code: result.code, active: result.active },
  });

  return result;
}

export async function listCourses(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      include: {
        unit: true,
        _count: { select: { classGroups: true, students: true } },
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.course.count(),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function saveCourse(input: CourseInput & { id?: string }, actorId?: string) {
  const parsed = courseSchema.parse(input);
  const result = input.id
    ? await prisma.course.update({
        where: { id: input.id },
        data: parsed,
      })
    : await prisma.course.create({
        data: parsed,
      });

  await createAuditLog({
    userId: actorId,
    action: input.id ? "COURSE_UPDATED" : "COURSE_CREATED",
    entity: "Course",
    entityId: result.id,
    metadata: { code: result.code, active: result.active },
  });

  return result;
}

export async function listClassGroups(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const [items, total] = await Promise.all([
    prisma.classGroup.findMany({
      include: {
        course: {
          include: {
            unit: true,
          },
        },
        _count: { select: { students: true } },
      },
      orderBy: [{ active: "desc" }, { period: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.classGroup.count(),
  ]);

  return createPageResult(items, total, page, pageSize);
}

export async function saveClassGroup(
  input: ClassGroupInput & { id?: string },
  actorId?: string,
) {
  const parsed = classGroupSchema.parse(input);
  const result = input.id
    ? await prisma.classGroup.update({
        where: { id: input.id },
        data: parsed,
      })
    : await prisma.classGroup.create({
        data: parsed,
      });

  await createAuditLog({
    userId: actorId,
    action: input.id ? "CLASSGROUP_UPDATED" : "CLASSGROUP_CREATED",
    entity: "ClassGroup",
    entityId: result.id,
    metadata: { period: result.period, active: result.active },
  });

  return result;
}

export async function getInstitutionOptions() {
  const [units, courses, classGroups] = await Promise.all([
    prisma.institutionUnit.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.course.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.classGroup.findMany({
      where: { active: true },
      orderBy: [{ period: "desc" }, { name: "asc" }],
    }),
  ]);

  return { units, courses, classGroups };
}
