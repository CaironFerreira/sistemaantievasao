"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { requireCapability } from "@/lib/permissions";
import { sanitizeErrorMessage } from "@/server/services/audit-service";
import {
  addIntervention,
  updateCaseStatus,
} from "@/server/services/follow-up-service";
import {
  saveClassGroup,
  saveCourse,
  saveUnit,
} from "@/server/services/institution-service";
import { processCsvImport } from "@/server/services/import-service";
import { saveRiskRule, reprocessRisk } from "@/server/services/risk-service";
import {
  saveAcademicRecord,
  saveStudent,
} from "@/server/services/student-service";
import { saveUser, toggleUserActive } from "@/server/services/user-service";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: FormDataEntryValue | null) {
  const parsed = asString(value).trim();
  return parsed.length > 0 ? parsed : undefined;
}

function asBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function saveUserAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "users:manage");

  try {
    await saveUser(
      {
        id: asOptionalString(formData.get("id")),
        name: asString(formData.get("name")),
        email: asString(formData.get("email")),
        password: asOptionalString(formData.get("password")),
        role: asString(formData.get("role")) as
          | "ADMIN"
          | "GESTOR"
          | "ACOMPANHAMENTO"
          | "LEITURA",
        active: asBoolean(formData, "active"),
      },
      session.user.id,
    );
    revalidatePath("/configuracoes/usuarios");
  } catch (error) {
    throw new Error(sanitizeErrorMessage(error));
  }
}

export async function toggleUserAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "users:manage");

  await toggleUserActive(
    asString(formData.get("id")),
    asString(formData.get("active")) === "true",
    session.user.id,
  );
  revalidatePath("/configuracoes/usuarios");
}

export async function saveUnitAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "institutions:manage");

  await saveUnit(
    {
      id: asOptionalString(formData.get("id")),
      name: asString(formData.get("name")),
      code: asString(formData.get("code")),
      active: asBoolean(formData, "active"),
    },
    session.user.id,
  );
  revalidatePath("/configuracoes/unidades");
}

export async function saveCourseAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "institutions:manage");

  await saveCourse(
    {
      id: asOptionalString(formData.get("id")),
      unitId: asString(formData.get("unitId")),
      name: asString(formData.get("name")),
      code: asString(formData.get("code")),
      active: asBoolean(formData, "active"),
    },
    session.user.id,
  );
  revalidatePath("/configuracoes/cursos");
}

export async function saveClassGroupAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "institutions:manage");

  await saveClassGroup(
    {
      id: asOptionalString(formData.get("id")),
      courseId: asString(formData.get("courseId")),
      name: asString(formData.get("name")),
      period: asString(formData.get("period")),
      active: asBoolean(formData, "active"),
    },
    session.user.id,
  );
  revalidatePath("/configuracoes/turmas");
}

export async function saveStudentAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "students:manage");

  await saveStudent(
    {
      id: asOptionalString(formData.get("id")),
      enrollmentCode: asString(formData.get("enrollmentCode")),
      name: asString(formData.get("name")),
      email: asString(formData.get("email")),
      courseId: asString(formData.get("courseId")),
      classGroupId: asString(formData.get("classGroupId")),
      status: asString(formData.get("status")) || "ACTIVE",
      active: asBoolean(formData, "active"),
    },
    session.user.id,
  );
  revalidatePath("/alunos");
}

export async function saveAcademicRecordAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "students:manage");

  try {
    await saveAcademicRecord(
      {
        id: asOptionalString(formData.get("id")),
        studentId: asString(formData.get("studentId")),
        period: asString(formData.get("period")),
        attendancePercent: Number(asString(formData.get("attendancePercent"))),
        averageGrade: Number(asString(formData.get("averageGrade"))),
        pendingAssignments: Number(asString(formData.get("pendingAssignments"))),
        totalAssignments: Number(asString(formData.get("totalAssignments"))),
        source: (asString(formData.get("source")) || "MANUAL") as "MANUAL" | "CSV",
      },
      session.user.id,
    );
    revalidatePath("/alunos");
    revalidatePath("/alertas");
    revalidatePath("/acompanhamentos");
    revalidatePath("/relatorios");
  } catch (error) {
    throw new Error(sanitizeErrorMessage(error));
  }
}

export async function saveRiskRuleAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "risk-rules:manage");

  await saveRiskRule(
    {
      id: asOptionalString(formData.get("id")),
      unitId: asString(formData.get("unitId")),
      period: asString(formData.get("period")),
      name: asString(formData.get("name")),
      highRiskAttendanceThreshold: Number(
        asString(formData.get("highRiskAttendanceThreshold")),
      ),
      mediumRiskAttendanceThreshold: Number(
        asString(formData.get("mediumRiskAttendanceThreshold")),
      ),
      highRiskGradeThreshold: Number(asString(formData.get("highRiskGradeThreshold"))),
      mediumRiskGradeThreshold: Number(
        asString(formData.get("mediumRiskGradeThreshold")),
      ),
      highRiskPendingAssignmentsThreshold: Number(
        asString(formData.get("highRiskPendingAssignmentsThreshold")),
      ),
      mediumRiskPendingAssignmentsThreshold: Number(
        asString(formData.get("mediumRiskPendingAssignmentsThreshold")),
      ),
      attendanceWeight: Number(asString(formData.get("attendanceWeight"))),
      gradeWeight: Number(asString(formData.get("gradeWeight"))),
      assignmentsWeight: Number(asString(formData.get("assignmentsWeight"))),
      active: asBoolean(formData, "active"),
    },
    session.user.id,
  );
  revalidatePath("/configuracoes/regras-risco");
}

export async function reprocessRiskAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "risk-rules:manage");

  await reprocessRisk(
    asString(formData.get("unitId")),
    asString(formData.get("period")),
    session.user.id,
  );
  revalidatePath("/alertas");
  revalidatePath("/acompanhamentos");
  revalidatePath("/relatorios");
  revalidatePath("/dashboard");
}

export async function importCsvAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "imports:manage");

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Selecione um arquivo CSV valido.");
  }

  const content = await file.text();
  await processCsvImport(content, session.user.id);
  revalidatePath("/importacoes");
  revalidatePath("/alunos");
  revalidatePath("/alertas");
  revalidatePath("/acompanhamentos");
  revalidatePath("/relatorios");
  revalidatePath("/dashboard");
}

export async function addInterventionAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "followup:manage");

  await addIntervention(
    {
      caseId: asString(formData.get("caseId")),
      causeCategoryId: asString(formData.get("causeCategoryId")),
      actionTaken: asString(formData.get("actionTaken")),
      notes: asOptionalString(formData.get("notes")),
    },
    session.user.id,
  );
  const caseId = asString(formData.get("caseId"));
  revalidatePath(`/acompanhamentos/${caseId}`);
  revalidatePath("/acompanhamentos");
  revalidatePath("/relatorios");
}

export async function updateCaseStatusAction(formData: FormData) {
  const session = await requireSession();
  requireCapability(session.user.role, "followup:manage");

  const caseId = asString(formData.get("caseId"));
  await updateCaseStatus(
    caseId,
    asString(formData.get("status")) as "PENDING" | "IN_PROGRESS" | "COMPLETED",
    session.user.id,
  );
  revalidatePath(`/acompanhamentos/${caseId}`);
  revalidatePath("/acompanhamentos");
  revalidatePath("/relatorios");
}
