import { describe, expect, it } from "vitest";

import { parseCsvContent } from "@/server/services/import-service";

describe("parseCsvContent", () => {
  it("aceita linhas validas", () => {
    const rows = parseCsvContent(`enrollmentCode,studentName,studentEmail,unitCode,courseCode,classGroupName,period,attendancePercent,averageGrade,pendingAssignments,totalAssignments
2026001,Ana Ribeiro,ana@alunos.local,CAMPUS-CENTRO,ADS,ADS-1A,2026.1,82,7.5,1,8`);

    expect(rows).toHaveLength(1);
    expect(rows[0].data?.studentName).toBe("Ana Ribeiro");
    expect(rows[0].error).toBeUndefined();
  });

  it("rejeita valores inconsistentes", () => {
    const rows = parseCsvContent(`enrollmentCode,studentName,studentEmail,unitCode,courseCode,classGroupName,period,attendancePercent,averageGrade,pendingAssignments,totalAssignments
2026001,Ana Ribeiro,ana@alunos.local,CAMPUS-CENTRO,ADS,ADS-1A,2026.1,82,7.5,9,8`);

    expect(rows[0].error).toContain("Pendencias nao podem superar o total de atividades.");
  });

  it("falha quando cabecalhos obrigatorios nao existem", () => {
    expect(() =>
      parseCsvContent(`studentName,studentEmail
Ana Ribeiro,ana@alunos.local`),
    ).toThrow("Colunas obrigatorias ausentes");
  });
});
