import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
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
  saveAcademicRecordAction,
  saveStudentAction,
} from "@/server/actions/management-actions";
import { getInstitutionOptions } from "@/server/services/institution-service";
import { listStudents, getStudentOptions } from "@/server/services/student-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function StudentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "students:manage")) {
    redirect("/dashboard");
  }

  const [students, options, studentOptions] = await Promise.all([
    listStudents({
      page: Number(params.page ?? "1"),
      pageSize: 10,
    }),
    getInstitutionOptions(),
    getStudentOptions(),
  ]);

  return (
    <PageShell
      title="Alunos e dados academicos"
      description="Cadastro manual de estudantes e atualizacao de indicadores academicos por periodo."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Novo aluno</h2>
            <form action={saveStudentAction} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="student-code">Matricula</Label>
                <Input id="student-code" name="enrollmentCode" required />
              </div>
              <div>
                <Label htmlFor="student-name">Nome</Label>
                <Input id="student-name" name="name" required />
              </div>
              <div>
                <Label htmlFor="student-email">E-mail</Label>
                <Input id="student-email" name="email" required type="email" />
              </div>
              <div>
                <Label htmlFor="student-status">Status</Label>
                <Input id="student-status" defaultValue="ACTIVE" name="status" />
              </div>
              <div>
                <Label htmlFor="student-course">Curso</Label>
                <Select id="student-course" name="courseId" required>
                  <option value="">Selecione</option>
                  {options.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="student-group">Turma</Label>
                <Select id="student-group" name="classGroupId" required>
                  <option value="">Selecione</option>
                  {options.classGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} · {group.period}
                    </option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox defaultChecked name="active" />
                Aluno ativo
              </label>
              <div className="md:col-span-2">
                <Button type="submit">Salvar aluno</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Registro academico manual</h2>
            <form action={saveAcademicRecordAction} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="record-student">Aluno</Label>
                <Select id="record-student" name="studentId" required>
                  <option value="">Selecione</option>
                  {studentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} · {student.enrollmentCode}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="record-period">Periodo</Label>
                <Input id="record-period" name="period" placeholder="2026.1" required />
              </div>
              <div>
                <Label htmlFor="record-attendance">Frequencia (%)</Label>
                <Input id="record-attendance" max="100" min="0" name="attendancePercent" step="0.1" type="number" />
              </div>
              <div>
                <Label htmlFor="record-grade">Nota media</Label>
                <Input id="record-grade" max="10" min="0" name="averageGrade" step="0.1" type="number" />
              </div>
              <div>
                <Label htmlFor="record-pending">Pendencias</Label>
                <Input id="record-pending" min="0" name="pendingAssignments" type="number" />
              </div>
              <div>
                <Label htmlFor="record-total">Total de atividades</Label>
                <Input id="record-total" min="0" name="totalAssignments" type="number" />
              </div>
              <input name="source" type="hidden" value="MANUAL" />
              <div className="md:col-span-2">
                <Button type="submit">Salvar registro academico</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Aluno</TableHeadCell>
                  <TableHeadCell>Curso</TableHeadCell>
                  <TableHeadCell>Turma</TableHeadCell>
                  <TableHeadCell>Ultimo periodo</TableHeadCell>
                  <TableHeadCell>Risco</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {students.items.map((student) => (
                  <tr key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.enrollmentCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{student.course.name}</TableCell>
                    <TableCell>{student.classGroup.name}</TableCell>
                    <TableCell>{student.academicRecords[0]?.period ?? "-"}</TableCell>
                    <TableCell>
                      {student.riskAssessments[0] ? (
                        <Badge
                          variant={
                            student.riskAssessments[0].riskLevel === "HIGH"
                              ? "danger"
                              : student.riskAssessments[0].riskLevel === "MEDIUM"
                                ? "warning"
                                : "success"
                          }
                        >
                          {student.riskAssessments[0].riskLevel}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination page={students.page} pageCount={students.pageCount} pathname="/alunos" />
        </CardContent>
      </Card>
    </PageShell>
  );
}
