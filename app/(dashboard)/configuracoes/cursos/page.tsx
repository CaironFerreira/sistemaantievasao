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
import { saveCourseAction } from "@/server/actions/management-actions";
import { getInstitutionOptions, listCourses } from "@/server/services/institution-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "institutions:manage")) {
    redirect("/dashboard");
  }

  const [courses, options] = await Promise.all([
    listCourses({
      page: Number(params.page ?? "1"),
      pageSize: 10,
    }),
    getInstitutionOptions(),
  ]);

  return (
    <PageShell
      title="Cursos"
      description="Gestao de cursos vinculados a unidade institucional."
    >
      <Card>
        <CardContent>
          <form action={saveCourseAction} className="grid gap-4 lg:grid-cols-5">
            <div>
              <Label htmlFor="course-unit">Unidade</Label>
              <Select id="course-unit" name="unitId" required>
                <option value="">Selecione</option>
                {options.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="course-name">Nome</Label>
              <Input id="course-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="course-code">Codigo</Label>
              <Input id="course-code" name="code" required />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium lg:pt-8">
              <Checkbox defaultChecked name="active" />
              Curso ativo
            </label>
            <div className="lg:pt-7">
              <Button type="submit">Salvar curso</Button>
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
                  <TableHeadCell>Curso</TableHeadCell>
                  <TableHeadCell>Unidade</TableHeadCell>
                  <TableHeadCell>Codigo</TableHeadCell>
                  <TableHeadCell>Turmas</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {courses.items.map((course) => (
                  <tr key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.unit.name}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course._count.classGroups}</TableCell>
                    <TableCell>{course.active ? "Ativo" : "Inativo"}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={courses.page}
            pageCount={courses.pageCount}
            pathname="/configuracoes/cursos"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
