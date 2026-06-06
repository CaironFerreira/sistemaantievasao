import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { saveUnitAction } from "@/server/actions/management-actions";
import { listUnits } from "@/server/services/institution-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function UnitsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "institutions:manage")) {
    redirect("/dashboard");
  }

  const units = await listUnits({
    page: Number(params.page ?? "1"),
    pageSize: 10,
  });

  return (
    <PageShell
      title="Unidades"
      description="Cadastro institucional da unidade piloto com base preparada para expansao futura."
    >
      <Card>
        <CardContent>
          <form action={saveUnitAction} className="grid gap-4 lg:grid-cols-4">
            <div>
              <Label htmlFor="unit-name">Nome</Label>
              <Input id="unit-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="unit-code">Codigo</Label>
              <Input id="unit-code" name="code" required />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium lg:pt-8">
              <Checkbox defaultChecked name="active" />
              Unidade ativa
            </label>
            <div className="lg:pt-7">
              <Button type="submit">Salvar unidade</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Codigo</TableHeadCell>
                  <TableHeadCell>Cursos</TableHeadCell>
                  <TableHeadCell>Regras</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {units.items.map((unit) => (
                  <tr key={unit.id}>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.code}</TableCell>
                    <TableCell>{unit._count.courses}</TableCell>
                    <TableCell>{unit._count.riskRules}</TableCell>
                    <TableCell>{unit.active ? "Ativa" : "Inativa"}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={units.page}
            pageCount={units.pageCount}
            pathname="/configuracoes/unidades"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
