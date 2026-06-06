import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { getDashboardMetrics } from "@/server/services/report-service";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "dashboard:read")) {
    redirect("/login");
  }

  const metrics = await getDashboardMetrics();
  const statusMap = Object.fromEntries(
    metrics.casesByStatus.map((item) => [item.status, item._count]),
  );
  const riskMap = Object.fromEntries(
    metrics.latestAssessments.map((item) => [item.riskLevel, item._count]),
  );

  return (
    <PageShell
      title="Dashboard"
      description="Visao tatico-operacional com o estado geral do monitoramento estudantil."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Estudantes monitorados",
            value: metrics.monitoredStudents,
          },
          { label: "Alertas abertos", value: metrics.openAlerts },
          {
            label: "Casos em andamento",
            value: statusMap.IN_PROGRESS ?? 0,
          },
          {
            label: "Tempo medio de resposta (h)",
            value: metrics.responseTimeHours,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Distribuicao de risco</h2>
              <p className="text-sm text-muted-foreground">
                Ultimas classificacoes conhecidas no monitoramento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="danger">Alto risco: {riskMap.HIGH ?? 0}</Badge>
              <Badge variant="warning">Medio risco: {riskMap.MEDIUM ?? 0}</Badge>
              <Badge variant="success">Baixo risco: {riskMap.LOW ?? 0}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Fila de acompanhamento</h2>
              <p className="text-sm text-muted-foreground">
                Casos por status operacional.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="mt-2 text-2xl font-semibold">{statusMap.PENDING ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Em andamento</p>
                <p className="mt-2 text-2xl font-semibold">{statusMap.IN_PROGRESS ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Concluidos</p>
                <p className="mt-2 text-2xl font-semibold">{statusMap.COMPLETED ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
