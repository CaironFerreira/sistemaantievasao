import { notFound, redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { hasCapability } from "@/lib/permissions";
import {
  addInterventionAction,
  updateCaseStatusAction,
} from "@/server/actions/management-actions";
import { getCaseDetails, getCauseCategories } from "@/server/services/follow-up-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FollowUpCaseDetailPage({ params }: PageProps) {
  const [{ id }, session, causes] = await Promise.all([
    params,
    getSession(),
    getCauseCategories(),
  ]);

  if (!session || !hasCapability(session.user.role, "followup:manage")) {
    redirect("/dashboard");
  }

  const followUpCase = await getCaseDetails(id);
  if (!followUpCase) {
    notFound();
  }

  return (
    <PageShell
      title={`Caso de ${followUpCase.student.name}`}
      description="Historico consolidado de alertas, intervencoes e mudancas de status."
      actions={
        <form action={updateCaseStatusAction} className="flex gap-2">
          <input name="caseId" type="hidden" value={followUpCase.id} />
          <Button name="status" type="submit" value="IN_PROGRESS" variant="outline">
            Em andamento
          </Button>
          <Button name="status" type="submit" value="COMPLETED" variant="secondary">
            Concluir
          </Button>
          <Button name="status" type="submit" value="PENDING" variant="outline">
            Reabrir
          </Button>
        </form>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  followUpCase.status === "COMPLETED"
                    ? "success"
                    : followUpCase.status === "IN_PROGRESS"
                      ? "info"
                      : "warning"
                }
              >
                {followUpCase.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Aberto em {formatDate(followUpCase.openedAt)}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Curso</p>
                <p className="mt-2 font-medium">{followUpCase.student.course.name}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Turma</p>
                <p className="mt-2 font-medium">{followUpCase.student.classGroup.name}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Ultimo periodo</p>
                <p className="mt-2 font-medium">{followUpCase.period}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Alertas vinculados</p>
                <p className="mt-2 font-medium">{followUpCase.alerts.length}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Alertas</h2>
              <div className="mt-3 space-y-3">
                {followUpCase.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === "CRITICAL" ? "danger" : "warning"}>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(alert.generatedAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Registrar intervencao</h2>
            <form action={addInterventionAction} className="grid gap-4">
              <input name="caseId" type="hidden" value={followUpCase.id} />
              <div>
                <Label htmlFor="causeCategoryId">Causa</Label>
                <Select id="causeCategoryId" name="causeCategoryId" required>
                  <option value="">Selecione</option>
                  {causes.map((cause) => (
                    <option key={cause.id} value={cause.id}>
                      {cause.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="actionTaken">Acao realizada</Label>
                <Input id="actionTaken" name="actionTaken" required />
              </div>
              <div>
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <Button type="submit">Salvar intervencao</Button>
            </form>
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Historico</h3>
              {followUpCase.interventions.map((intervention) => (
                <div key={intervention.id} className="rounded-2xl border border-border p-4">
                  <p className="font-medium">{intervention.actionTaken}</p>
                  <p className="text-sm text-muted-foreground">
                    {intervention.causeCategory.name} · {intervention.createdBy.name} ·{" "}
                    {formatDate(intervention.createdAt)}
                  </p>
                  {intervention.notes ? <p className="mt-2 text-sm">{intervention.notes}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
