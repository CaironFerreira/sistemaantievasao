import { hash } from "bcryptjs";

import { env } from "../src/lib/env";
import { prisma } from "../src/lib/prisma";
import { assessAcademicRecord } from "../src/server/services/risk-service";

const causeCategories = [
  "dificuldade academica",
  "baixa frequencia",
  "baixo desempenho",
  "dificuldade socioeconomica",
  "problema de saude",
  "dificuldade de transporte",
  "desmotivacao",
  "trabalho/conflito de horario",
  "nao informado",
  "outro",
];

async function main() {
  const adminPassword = await hash(env.ADMIN_PASSWORD ?? "Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL ?? "admin@sdd.local" },
    update: {
      name: "Administrador",
      role: "ADMIN",
      active: true,
      passwordHash: adminPassword,
    },
    create: {
      name: "Administrador",
      email: env.ADMIN_EMAIL ?? "admin@sdd.local",
      role: "ADMIN",
      active: true,
      passwordHash: adminPassword,
    },
  });

  await Promise.all(
    [
      {
        name: "Gestor Institucional",
        email: "gestor@sdd.local",
        role: "GESTOR" as const,
      },
      {
        name: "Equipe Acompanhamento",
        email: "acompanhamento@sdd.local",
        role: "ACOMPANHAMENTO" as const,
      },
      {
        name: "Leitura Gerencial",
        email: "leitura@sdd.local",
        role: "LEITURA" as const,
      },
    ].map(async (user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          active: true,
          passwordHash: await hash("Admin123!", 10),
        },
        create: {
          ...user,
          active: true,
          passwordHash: await hash("Admin123!", 10),
        },
      }),
    ),
  );

  const unit = await prisma.institutionUnit.upsert({
    where: { code: "CAMPUS-CENTRO" },
    update: {
      name: "Campus Centro",
      active: true,
    },
    create: {
      name: "Campus Centro",
      code: "CAMPUS-CENTRO",
      active: true,
    },
  });

  const course = await prisma.course.upsert({
    where: {
      unitId_code: {
        unitId: unit.id,
        code: "ADS",
      },
    },
    update: {
      name: "Analise e Desenvolvimento de Sistemas",
      active: true,
    },
    create: {
      unitId: unit.id,
      code: "ADS",
      name: "Analise e Desenvolvimento de Sistemas",
      active: true,
    },
  });

  const classGroup = await prisma.classGroup.upsert({
    where: {
      courseId_name_period: {
        courseId: course.id,
        name: "ADS-1A",
        period: "2026.1",
      },
    },
    update: {
      active: true,
    },
    create: {
      courseId: course.id,
      name: "ADS-1A",
      period: "2026.1",
      active: true,
    },
  });

  const rule = await prisma.riskRule.upsert({
    where: {
      id:
        (
          await prisma.riskRule.findFirst({
            where: {
              unitId: unit.id,
              period: "2026.1",
            },
          })
        )?.id ?? "seed-risk-rule",
    },
    update: {
      name: "Regra piloto 2026.1",
      active: true,
      highRiskAttendanceThreshold: 65,
      mediumRiskAttendanceThreshold: 80,
      highRiskGradeThreshold: 4,
      mediumRiskGradeThreshold: 6,
      highRiskPendingAssignmentsThreshold: 4,
      mediumRiskPendingAssignmentsThreshold: 2,
      attendanceWeight: 0.4,
      gradeWeight: 0.35,
      assignmentsWeight: 0.25,
    },
    create: {
      id: "seed-risk-rule",
      unitId: unit.id,
      period: "2026.1",
      name: "Regra piloto 2026.1",
      active: true,
      highRiskAttendanceThreshold: 65,
      mediumRiskAttendanceThreshold: 80,
      highRiskGradeThreshold: 4,
      mediumRiskGradeThreshold: 6,
      highRiskPendingAssignmentsThreshold: 4,
      mediumRiskPendingAssignmentsThreshold: 2,
      attendanceWeight: 0.4,
      gradeWeight: 0.35,
      assignmentsWeight: 0.25,
      createdById: admin.id,
    },
  });

  void rule;

  await Promise.all(
    causeCategories.map((name) =>
      prisma.causeCategory.upsert({
        where: { name },
        update: { active: true },
        create: { name, active: true },
      }),
    ),
  );

  const students = await Promise.all(
    [
      {
        enrollmentCode: "2026001",
        name: "Ana Ribeiro",
        email: "ana.ribeiro@alunos.local",
      },
      {
        enrollmentCode: "2026002",
        name: "Bruno Souza",
        email: "bruno.souza@alunos.local",
      },
      {
        enrollmentCode: "2026003",
        name: "Carla Mendes",
        email: "carla.mendes@alunos.local",
      },
    ].map((student) =>
      prisma.student.upsert({
        where: { enrollmentCode: student.enrollmentCode },
        update: {
          ...student,
          courseId: course.id,
          classGroupId: classGroup.id,
          status: "ACTIVE",
          active: true,
        },
        create: {
          ...student,
          courseId: course.id,
          classGroupId: classGroup.id,
          status: "ACTIVE",
          active: true,
        },
      }),
    ),
  );

  const records = await Promise.all(
    [
      {
        studentId: students[0].id,
        period: "2026.1",
        attendancePercent: 58,
        averageGrade: 3.8,
        pendingAssignments: 5,
        totalAssignments: 8,
      },
      {
        studentId: students[1].id,
        period: "2026.1",
        attendancePercent: 76,
        averageGrade: 5.9,
        pendingAssignments: 2,
        totalAssignments: 8,
      },
      {
        studentId: students[2].id,
        period: "2026.1",
        attendancePercent: 92,
        averageGrade: 8.1,
        pendingAssignments: 0,
        totalAssignments: 8,
      },
    ].map((record) =>
      prisma.academicRecord.upsert({
        where: {
          studentId_period: {
            studentId: record.studentId,
            period: record.period,
          },
        },
        update: {
          ...record,
          source: "CSV",
          importedAt: new Date(),
        },
        create: {
          ...record,
          source: "CSV",
          importedAt: new Date(),
        },
      }),
    ),
  );

  for (const record of records) {
    await assessAcademicRecord(record.id, admin.id);
  }

  const firstCase = await prisma.followUpCase.findFirst({
    orderBy: { openedAt: "asc" },
  });

  const cause = await prisma.causeCategory.findFirst({
    where: { name: "dificuldade academica" },
  });

  if (firstCase && cause) {
    const existing = await prisma.intervention.findFirst({
      where: { caseId: firstCase.id },
    });

    if (!existing) {
      await prisma.intervention.create({
        data: {
          caseId: firstCase.id,
          causeCategoryId: cause.id,
          actionTaken: "Contato inicial com o estudante e orientacao academica.",
          notes: "Aluno informou dificuldade de adaptacao com a carga horaria.",
          createdById: admin.id,
        },
      });

      await prisma.followUpCase.update({
        where: { id: firstCase.id },
        data: { status: "IN_PROGRESS" },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
