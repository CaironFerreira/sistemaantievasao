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
import { saveClassGroupAction } from "@/server/actions/management-actions";
import { getInstitutionOptions, listClassGroups } from "@/server/services/institution-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ClassGroupsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "institutions:manage")) {
    redirect("/dashboard");
  }

  const [classGroups, options] = await Promise.all([
    listClassGroups({
      page: Number(params.page ?? "1"),
      pageSize: 10,
    }),
    getInstitutionOptions(),
  ]);

  return (
    <PageShell
      title="Turmas"
      description="Cadastro das turmas por curso e periodo letivo."
    >
      <Card>
        <CardContent>
          <form action={saveClassGroupAction} className="grid gap-4 lg:grid-cols-5">
            <div>
              <Label htmlFor="group-course">Curso</Label>
              <Select id="group-course" name="courseId" required>
                <option value="">Selecione</option>
                {options.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="group-name">Turma</Label>
              <Input id="group-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="group-period">Periodo</Label>
              <Input id="group-period" name="period" placeholder="2026.1" required />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium lg:pt-8">
              <Checkbox defaultChecked name="active" />
              Turma ativa
            </label>
            <div className="lg:pt-7">
              <Button type="submit">Salvar turma</Button>
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
                  <TableHeadCell>Turma</TableHeadCell>
                  <TableHeadCell>Periodo</TableHeadCell>
                  <TableHeadCell>Curso</TableHeadCell>
                  <TableHeadCell>Unidade</TableHeadCell>
                  <TableHeadCell>Alunos</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {classGroups.items.map((classGroup) => (
                  <tr key={classGroup.id}>
                    <TableCell>{classGroup.name}</TableCell>
                    <TableCell>{classGroup.period}</TableCell>
                    <TableCell>{classGroup.course.name}</TableCell>
                    <TableCell>{classGroup.course.unit.name}</TableCell>
                    <TableCell>{classGroup._count.students}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={classGroups.page}
            pageCount={classGroups.pageCount}
            pathname="/configuracoes/turmas"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
