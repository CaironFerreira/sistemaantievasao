import { prisma } from "@/lib/prisma";
import { csvRowSchema } from "@/lib/validators";
import { createAuditLog } from "@/server/services/audit-service";
import { assessAcademicRecord } from "@/server/services/risk-service";

export type ParsedCsvRow = {
  rowNumber: number;
  raw: string[];
  data?: ReturnType<typeof csvRowSchema.parse>;
  error?: string;
};

const expectedHeaders = [
  "enrollmentCode",
  "studentName",
  "studentEmail",
  "unitCode",
  "courseCode",
  "classGroupName",
  "period",
  "attendancePercent",
  "averageGrade",
  "pendingAssignments",
  "totalAssignments",
];

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      if (insideQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current.trim());
  return result;
}

export function parseCsvContent(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Arquivo CSV sem linhas suficientes para processamento.");
  }

  const headers = parseCsvLine(lines[0]);
  const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Colunas obrigatorias ausentes: ${missingHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const object = Object.fromEntries(
      headers.map((header, position) => [header, values[position] ?? ""]),
    );
    const parsed = csvRowSchema.safeParse({
      ...object,
      attendancePercent: Number(object.attendancePercent),
      averageGrade: Number(object.averageGrade),
      pendingAssignments: Number(object.pendingAssignments),
      totalAssignments: Number(object.totalAssignments),
    });

    if (!parsed.success) {
      return {
        rowNumber: index + 2,
        raw: values,
        error: parsed.error.issues.map((issue) => issue.message).join("; "),
      } satisfies ParsedCsvRow;
    }

    return {
      rowNumber: index + 2,
      raw: values,
      data: parsed.data,
    } satisfies ParsedCsvRow;
  });
}

export async function processCsvImport(content: string, actorId?: string) {
  const rows = parseCsvContent(content);
  const accepted = rows.filter((row) => row.data);
  const rejected = rows.filter((row) => row.error);
  let acceptedCount = 0;

  for (const row of accepted) {
    if (!row.data) {
      continue;
    }

    const unit = await prisma.institutionUnit.findUnique({
      where: { code: row.data.unitCode },
    });

    if (!unit) {
      rejected.push({
        rowNumber: row.rowNumber,
        raw: row.raw,
        error: `Unidade ${row.data.unitCode} nao cadastrada.`,
      });
      continue;
    }

    const course = await prisma.course.findFirst({
      where: {
        unitId: unit.id,
        code: row.data.courseCode,
      },
    });

    if (!course) {
      rejected.push({
        rowNumber: row.rowNumber,
        raw: row.raw,
        error: `Curso ${row.data.courseCode} nao encontrado para a unidade.`,
      });
      continue;
    }

    const classGroup = await prisma.classGroup.findFirst({
      where: {
        courseId: course.id,
        name: row.data.classGroupName,
        period: row.data.period,
      },
    });

    if (!classGroup) {
      rejected.push({
        rowNumber: row.rowNumber,
        raw: row.raw,
        error: `Turma ${row.data.classGroupName} nao cadastrada no periodo ${row.data.period}.`,
      });
      continue;
    }

    const academicRecord = await prisma.$transaction(async (tx) => {
      const student = await tx.student.upsert({
        where: { enrollmentCode: row.data.enrollmentCode },
        create: {
          enrollmentCode: row.data.enrollmentCode,
          name: row.data.studentName,
          email: row.data.studentEmail,
          courseId: course.id,
          classGroupId: classGroup.id,
          status: "ACTIVE",
          active: true,
        },
        update: {
          name: row.data.studentName,
          email: row.data.studentEmail,
          courseId: course.id,
          classGroupId: classGroup.id,
        },
      });

      return tx.academicRecord.upsert({
        where: {
          studentId_period: {
            studentId: student.id,
            period: row.data.period,
          },
        },
        create: {
          studentId: student.id,
          period: row.data.period,
          attendancePercent: row.data.attendancePercent,
          averageGrade: row.data.averageGrade,
          pendingAssignments: row.data.pendingAssignments,
          totalAssignments: row.data.totalAssignments,
          source: "CSV",
          importedAt: new Date(),
        },
        update: {
          period: row.data.period,
          attendancePercent: row.data.attendancePercent,
          averageGrade: row.data.averageGrade,
          pendingAssignments: row.data.pendingAssignments,
          totalAssignments: row.data.totalAssignments,
          source: "CSV",
          importedAt: new Date(),
        },
      });
    });

    await assessAcademicRecord(academicRecord.id, actorId);
    acceptedCount += 1;
  }

  await createAuditLog({
    userId: actorId,
    action: "CSV_IMPORT_EXECUTED",
    entity: "AcademicRecord",
    entityId: crypto.randomUUID(),
    metadata: {
      accepted: accepted.length,
      rejected: rejected.length,
    },
  });

  return {
    acceptedCount,
    rejected,
  };
}
