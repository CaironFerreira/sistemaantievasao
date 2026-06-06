import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import {
  reprocessRiskAction,
  saveRiskRuleAction,
} from "@/server/actions/management-actions";
import { getInstitutionOptions, listUnits } from "@/server/services/institution-service";
import { listRiskRules } from "@/server/services/risk-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function RiskRulesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "risk-rules:manage")) {
    redirect("/dashboard");
  }

  const [rules, options] = await Promise.all([
    listRiskRules({
      page: Number(params.page ?? "1"),
      pageSize: 10,
    }),
    getInstitutionOptions(),
  ]);

  return (
    <PageShell
      title="Regras de risco"
      description="Configuracao dos limiares institucionais de frequencia, nota e pendencias."
    >
      <Card>
        <CardContent className="space-y-5">
          <h2 className="text-lg font-semibold">Nova regra</h2>
          <form action={saveRiskRuleAction} className="grid gap-4 lg:grid-cols-4">
            <div>
              <Label htmlFor="rule-unit">Unidade</Label>
              <Select id="rule-unit" name="unitId" required>
                <option value="">Selecione</option>
                {options.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="rule-period">Periodo</Label>
              <Input id="rule-period" name="period" placeholder="2026.1" required />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="rule-name">Nome</Label>
              <Input id="rule-name" name="name" placeholder="Regra piloto 2026.1" required />
            </div>
            <div>
              <Label htmlFor="attendance-high">Freq. alto risco</Label>
              <Input id="attendance-high" min="0" max="100" name="highRiskAttendanceThreshold" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="attendance-medium">Freq. medio risco</Label>
              <Input id="attendance-medium" min="0" max="100" name="mediumRiskAttendanceThreshold" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="grade-high">Nota alto risco</Label>
              <Input id="grade-high" min="0" max="10" name="highRiskGradeThreshold" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="grade-medium">Nota medio risco</Label>
              <Input id="grade-medium" min="0" max="10" name="mediumRiskGradeThreshold" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="pending-high">Pendencias alto risco</Label>
              <Input id="pending-high" min="0" name="highRiskPendingAssignmentsThreshold" type="number" />
            </div>
            <div>
              <Label htmlFor="pending-medium">Pendencias medio risco</Label>
              <Input id="pending-medium" min="0" name="mediumRiskPendingAssignmentsThreshold" type="number" />
            </div>
            <div>
              <Label htmlFor="weight-attendance">Peso frequencia</Label>
              <Input id="weight-attendance" max="1" min="0" name="attendanceWeight" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="weight-grade">Peso nota</Label>
              <Input id="weight-grade" max="1" min="0" name="gradeWeight" step="0.1" type="number" />
            </div>
            <div>
              <Label htmlFor="weight-assignments">Peso pendencias</Label>
              <Input id="weight-assignments" max="1" min="0" name="assignmentsWeight" step="0.1" type="number" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium lg:pt-8">
              <Checkbox defaultChecked name="active" />
              Regra ativa
            </label>
            <div className="lg:col-span-4">
              <Button type="submit">Salvar regra</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold">Reprocessamento manual</h2>
            <form action={reprocessRiskAction} className="grid gap-3 md:grid-cols-3">
              <Select name="unitId" required>
                <option value="">Unidade</option>
                {options.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
              <Input name="period" placeholder="2026.1" required />
              <Button type="submit" variant="outline">
                Reprocessar risco
              </Button>
            </form>
          </div>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Regra</TableHeadCell>
                  <TableHeadCell>Unidade</TableHeadCell>
                  <TableHeadCell>Periodo</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Classificacoes</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {rules.items.map((rule) => (
                  <tr key={rule.id}>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{rule.unit.name}</TableCell>
                    <TableCell>{rule.period}</TableCell>
                    <TableCell>{rule.active ? "Ativa" : "Inativa"}</TableCell>
                    <TableCell>{rule._count.riskAssessments}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={rules.page}
            pageCount={rules.pageCount}
            pathname="/configuracoes/regras-risco"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
