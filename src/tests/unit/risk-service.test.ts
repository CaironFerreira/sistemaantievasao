import { describe, expect, it } from "vitest";

import { calculateRisk } from "@/server/services/risk-service";

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

describe("calculateRisk", () => {
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
});
