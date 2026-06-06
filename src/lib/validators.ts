import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "Informe a senha."),
});

export const userSchema = z.object({
  name: z.string().min(3, "Informe o nome."),
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").optional(),
  role: z.enum(["ADMIN", "GESTOR", "ACOMPANHAMENTO", "LEITURA"]),
  active: z.coerce.boolean().default(true),
});

export const institutionUnitSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2).max(30),
  active: z.coerce.boolean().default(true),
});

export const courseSchema = z.object({
  unitId: z.string().min(1),
  name: z.string().min(3),
  code: z.string().min(2).max(30),
  active: z.coerce.boolean().default(true),
});

export const classGroupSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(2),
  period: z.string().min(4),
  active: z.coerce.boolean().default(true),
});

export const studentSchema = z.object({
  enrollmentCode: z.string().min(3),
  name: z.string().min(3),
  email: z.string().email(),
  courseId: z.string().min(1),
  classGroupId: z.string().min(1),
  status: z.string().min(2).default("ACTIVE"),
  active: z.coerce.boolean().default(true),
});

export const academicRecordSchema = z
  .object({
    studentId: z.string().min(1),
    period: z.string().min(4),
    attendancePercent: z.coerce.number().min(0).max(100),
    averageGrade: z.coerce.number().min(0).max(10),
    pendingAssignments: z.coerce.number().int().min(0),
    totalAssignments: z.coerce.number().int().min(0),
    source: z.enum(["MANUAL", "CSV"]).default("MANUAL"),
  })
  .superRefine((value, ctx) => {
    if (value.pendingAssignments > value.totalAssignments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pendingAssignments"],
        message: "Pendencias nao podem superar o total de atividades.",
      });
    }
  });

export const riskRuleSchema = z
  .object({
    unitId: z.string().min(1),
    period: z.string().min(4),
    name: z.string().min(3),
    highRiskAttendanceThreshold: z.coerce.number().min(0).max(100),
    mediumRiskAttendanceThreshold: z.coerce.number().min(0).max(100),
    highRiskGradeThreshold: z.coerce.number().min(0).max(10),
    mediumRiskGradeThreshold: z.coerce.number().min(0).max(10),
    highRiskPendingAssignmentsThreshold: z.coerce.number().int().min(0),
    mediumRiskPendingAssignmentsThreshold: z.coerce.number().int().min(0),
    attendanceWeight: z.coerce.number().min(0).max(1),
    gradeWeight: z.coerce.number().min(0).max(1),
    assignmentsWeight: z.coerce.number().min(0).max(1),
    active: z.coerce.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.highRiskAttendanceThreshold >= value.mediumRiskAttendanceThreshold) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["highRiskAttendanceThreshold"],
        message: "O limite de alto risco deve ser menor que o limite de medio risco.",
      });
    }

    if (value.highRiskGradeThreshold >= value.mediumRiskGradeThreshold) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["highRiskGradeThreshold"],
        message: "O limite de alto risco deve ser menor que o limite de medio risco.",
      });
    }

    if (
      value.highRiskPendingAssignmentsThreshold <=
      value.mediumRiskPendingAssignmentsThreshold
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["highRiskPendingAssignmentsThreshold"],
        message: "O limite de alto risco deve ser maior que o limite de medio risco.",
      });
    }
  });

export const followUpActionSchema = z.object({
  caseId: z.string().min(1),
  causeCategoryId: z.string().min(1),
  actionTaken: z.string().min(3),
  notes: z.string().optional(),
});

export const csvRowSchema = z
  .object({
    enrollmentCode: z.string().min(1),
    studentName: z.string().min(3),
    studentEmail: z.string().email(),
    unitCode: z.string().min(1),
    courseCode: z.string().min(1),
    classGroupName: z.string().min(1),
    period: z.string().min(4),
    attendancePercent: z.coerce.number().min(0).max(100),
    averageGrade: z.coerce.number().min(0).max(10),
    pendingAssignments: z.coerce.number().int().min(0),
    totalAssignments: z.coerce.number().int().min(0),
  })
  .superRefine((value, ctx) => {
    if (value.pendingAssignments > value.totalAssignments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pendingAssignments"],
        message: "Pendencias nao podem superar o total de atividades.",
      });
    }
  });

export type PaginationInput = z.infer<typeof paginationSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type InstitutionUnitInput = z.infer<typeof institutionUnitSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ClassGroupInput = z.infer<typeof classGroupSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type AcademicRecordInput = z.infer<typeof academicRecordSchema>;
export type RiskRuleInput = z.infer<typeof riskRuleSchema>;
export type FollowUpActionInput = z.infer<typeof followUpActionSchema>;
export type CsvRowInput = z.infer<typeof csvRowSchema>;
