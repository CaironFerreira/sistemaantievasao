import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ReportsCharts } from "@/components/charts/reports-charts";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { hasCapability } from "@/lib/permissions";
import { getInstitutionOptions } from "@/server/services/institution-service";
import { getAggregateReports } from "@/server/services/report-service";
import { getStudentOptions, getStudentReport } from "@/server/services/student-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "reports:read")) {
    redirect("/dashboard");
  }

  const [options, students, aggregate, studentReport] = await Promise.all([
    getInstitutionOptions(),
    getStudentOptions(),
    getAggregateReports({
      unitId: params.unitId,
      courseId: params.courseId,
      classGroupId: params.classGroupId,
      period: params.period,
    }),
    params.studentId ? getStudentReport(params.studentId) : Promise.resolve(null),
  ]);

  const caseStatusMap = Object.fromEntries(
    aggregate.cases.map((item) => [item.status, item._count]),
  );

  return (
    <PageShell
      title="Relatorios"
      description="Indicadores por aluno, turma, curso e periodo, com foco em risco e resposta institucional."
    >
      <Card>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-5">
            <Select defaultValue={params.unitId} name="unitId">
              <option value="">Todas as unidades</option>
              {options.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </Select>
            <Select defaultValue={params.courseId} name="courseId">
              <option value="">Todos os cursos</option>
              {options.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
            <Select defaultValue={params.classGroupId} name="classGroupId">
              <option value="">Todas as turmas</option>
              {options.classGroups.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.name} · {classGroup.period}
                </option>
              ))}
            </Select>
            <input
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
              defaultValue={params.period}
              name="period"
              placeholder="Periodo"
            />
            <button
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Aplicar filtros
            </button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Estudantes monitorados</p>
            <p className="mt-2 text-3xl font-semibold">{aggregate.students}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Casos pendentes</p>
            <p className="mt-2 text-3xl font-semibold">{caseStatusMap.PENDING ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Casos em andamento</p>
            <p className="mt-2 text-3xl font-semibold">{caseStatusMap.IN_PROGRESS ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Casos concluidos</p>
            <p className="mt-2 text-3xl font-semibold">{caseStatusMap.COMPLETED ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Resolucao de casos</p>
            <p className="mt-2 text-3xl font-semibold">{aggregate.resolutionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tempo medio ate a 1a acao</p>
            <p className="mt-2 text-3xl font-semibold">
              {aggregate.averageHoursToFirstAction}h
            </p>
          </CardContent>
        </Card>
      </div>
      <ReportsCharts
        causes={aggregate.causes}
        riskDistribution={aggregate.riskDistribution}
      />
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Relatorio individual</h2>
          <form className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Select defaultValue={params.studentId} name="studentId">
              <option value="">Selecione um aluno</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.enrollmentCode}
                </option>
              ))}
            </Select>
            <button
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Carregar
            </button>
          </form>
          {studentReport ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-lg font-semibold">{studentReport.name}</p>
                <p className="text-sm text-muted-foreground">
                  {studentReport.course.name} · {studentReport.classGroup.name} ·{" "}
                  {studentReport.course.unit.name}
                </p>
              </div>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <TableHeadCell>Periodo</TableHeadCell>
                      <TableHeadCell>Frequencia</TableHeadCell>
                      <TableHeadCell>Nota</TableHeadCell>
                      <TableHeadCell>Pendencias</TableHeadCell>
                      <TableHeadCell>Risco</TableHeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReport.academicRecords.map((record) => {
                      const assessment = studentReport.riskAssessments.find(
                        (risk) => risk.academicRecordId === record.id,
                      );
                      return (
                        <tr key={record.id}>
                          <TableCell>{record.period}</TableCell>
                          <TableCell>{record.attendancePercent}%</TableCell>
                          <TableCell>{record.averageGrade}</TableCell>
                          <TableCell>
                            {record.pendingAssignments}/{record.totalAssignments}
                          </TableCell>
                          <TableCell>{assessment?.riskLevel ?? "-"}</TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Intervencoes registradas</h3>
                {studentReport.followUpCases.flatMap((followUpCase) =>
                  followUpCase.interventions.map((intervention) => (
                    <div
                      key={intervention.id}
                      className="rounded-2xl border border-border p-4"
                    >
                      <p className="font-medium">{intervention.actionTaken}</p>
                      <p className="text-sm text-muted-foreground">
                        {intervention.causeCategory.name} · {formatDate(intervention.createdAt)}
                      </p>
                    </div>
                  )),
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
