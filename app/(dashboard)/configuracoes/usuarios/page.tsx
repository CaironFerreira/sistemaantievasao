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
import { hasCapability, roleLabels } from "@/lib/permissions";
import {
  saveUserAction,
  toggleUserAction,
} from "@/server/actions/management-actions";
import { listUsers } from "@/server/services/user-service";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "users:manage")) {
    redirect("/dashboard");
  }

  const users = await listUsers({
    page: Number(params.page ?? "1"),
    pageSize: 10,
  });

  return (
    <PageShell
      title="Usuarios"
      description="Gestao de acesso com perfis, ativacao, desativacao e protecao do ultimo administrador."
    >
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Novo usuario</h2>
          <form action={saveUserAction} className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input id="user-name" name="name" required />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="user-email">E-mail</Label>
              <Input id="user-email" name="email" required type="email" />
            </div>
            <div>
              <Label htmlFor="user-role">Perfil</Label>
              <Select id="user-role" name="role" required>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="user-password">Senha inicial</Label>
              <Input id="user-password" name="password" placeholder="Admin123!" type="password" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox defaultChecked name="active" />
              Usuario ativo
            </label>
            <div className="lg:col-span-5">
              <Button type="submit">Salvar usuario</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Usuarios cadastrados</h2>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>E-mail</TableHeadCell>
                  <TableHeadCell>Perfil</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Acao</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {users.items.map((user) => (
                  <tr key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleLabels[user.role]}</TableCell>
                    <TableCell>{user.active ? "Ativo" : "Inativo"}</TableCell>
                    <TableCell>
                      <form action={toggleUserAction} className="inline-flex">
                        <input name="id" type="hidden" value={user.id} />
                        <input
                          name="active"
                          type="hidden"
                          value={String(!user.active)}
                        />
                        <Button type="submit" variant="outline">
                          {user.active ? "Desativar" : "Reativar"}
                        </Button>
                      </form>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination
            page={users.page}
            pageCount={users.pageCount}
            pathname="/configuracoes/usuarios"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
