import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { hasCapability } from "@/lib/permissions";
import { getInstitutionOptions } from "@/server/services/institution-service";
import { listAlerts } from "@/server/services/follow-up-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AlertsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "alerts:read")) {
    redirect("/dashboard");
  }

  const [alerts, options] = await Promise.all([
    listAlerts({
      page: Number(params.page ?? "1"),
      pageSize: 10,
      severity: params.severity,
      status: params.status,
      period: params.period,
      courseId: params.courseId,
      classGroupId: params.classGroupId,
    }),
    getInstitutionOptions(),
  ]);

  return (
    <PageShell
      title="Alertas priorizados"
      description="Fila operacional ordenada por severidade, ausencia de acompanhamento e antiguidade do alerta."
    >
      <Card>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-5">
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
            <Select defaultValue={params.severity} name="severity">
              <option value="">Todas as severidades</option>
              <option value="CRITICAL">Critico</option>
              <option value="ATTENTION">Atencao</option>
            </Select>
            <Select defaultValue={params.status} name="status">
              <option value="">Todos os status</option>
              <option value="OPEN">Aberto</option>
              <option value="RESOLVED">Resolvido</option>
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
              Filtrar
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4">
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Prioridade</TableHeadCell>
                  <TableHeadCell>Aluno</TableHeadCell>
                  <TableHeadCell>Periodo</TableHeadCell>
                  <TableHeadCell>Motivos</TableHeadCell>
                  <TableHeadCell>Caso</TableHeadCell>
                  <TableHeadCell>Gerado em</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {alerts.items.map((alert) => (
                  <tr key={alert.id} className={alert.severity === "CRITICAL" ? "bg-rose-50" : ""}>
                    <TableCell>
                      <Badge variant={alert.severity === "CRITICAL" ? "danger" : "warning"}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.student.course.name} · {alert.student.classGroup.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{alert.riskAssessment.academicRecord.period}</TableCell>
                    <TableCell>{alert.description}</TableCell>
                    <TableCell>{alert.followUpCase ? alert.followUpCase.status : "Sem caso"}</TableCell>
                    <TableCell>{formatDate(alert.generatedAt)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={alerts.page}
            pageCount={alerts.pageCount}
            pathname="/alertas"
            searchParams={{
              courseId: params.courseId,
              classGroupId: params.classGroupId,
              severity: params.severity,
              status: params.status,
              period: params.period,
            }}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
