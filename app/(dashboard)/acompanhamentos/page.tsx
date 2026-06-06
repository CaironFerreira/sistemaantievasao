import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { hasCapability } from "@/lib/permissions";
import { listCases } from "@/server/services/follow-up-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FollowUpCasesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "followup:manage")) {
    redirect("/dashboard");
  }

  const cases = await listCases({
    page: Number(params.page ?? "1"),
    pageSize: 10,
    status: params.status,
  });

  return (
    <PageShell
      title="Casos de acompanhamento"
      description="Casos abertos automaticamente por alerta critico ou de atencao, com historico preservado."
    >
      <Card>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Select defaultValue={params.status} name="status">
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="COMPLETED">Concluido</option>
            </Select>
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
                  <TableHeadCell>Aluno</TableHeadCell>
                  <TableHeadCell>Periodo</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Alertas</TableHeadCell>
                  <TableHeadCell>Intervencoes</TableHeadCell>
                  <TableHeadCell>Aberto em</TableHeadCell>
                  <TableHeadCell></TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {cases.items.map((item) => (
                  <tr key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.student.course.name} · {item.student.classGroup.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.period}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "COMPLETED"
                            ? "success"
                            : item.status === "IN_PROGRESS"
                              ? "info"
                              : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.alerts.length}</TableCell>
                    <TableCell>{item.interventions.length}</TableCell>
                    <TableCell>{formatDate(item.openedAt)}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline">
                        <Link href={`/acompanhamentos/${item.id}`}>Detalhar</Link>
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination page={cases.page} pageCount={cases.pageCount} pathname="/acompanhamentos" />
        </CardContent>
      </Card>
    </PageShell>
  );
}
