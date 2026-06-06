import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { ImportCsvCard } from "@/features/imports/import-csv-card";

export default async function ImportsPage() {
  const session = await getSession();
  if (!session || !hasCapability(session.user.role, "imports:manage")) {
    redirect("/dashboard");
  }

  return (
    <PageShell
      title="Importacoes"
      description="Carga em lote de dados academicos com validacao, relatorio de rejeicoes e persistencia controlada."
    >
      <ImportCsvCard />
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Boas praticas</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Cadastre unidade, curso e turma antes de importar.</li>
            <li>Use um periodo letivo consistente em todas as linhas do lote.</li>
            <li>Registros rejeitados nao sao persistidos.</li>
          </ul>
        </CardContent>
      </Card>
    </PageShell>
  );
}
