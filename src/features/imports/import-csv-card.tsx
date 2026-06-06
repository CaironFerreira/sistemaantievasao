"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

type ImportResponse = {
  acceptedCount: number;
  rejected: Array<{
    rowNumber: number;
    error: string;
    raw: string[];
  }>;
};

export function ImportCsvCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Importacao CSV</h2>
          <p className="text-sm text-muted-foreground">
            Colunas esperadas: enrollmentCode, studentName, studentEmail, unitCode,
            courseCode, classGroupName, period, attendancePercent, averageGrade,
            pendingAssignments, totalAssignments.
          </p>
        </div>
        <form
          className="grid gap-4 lg:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await fetch("/api/imports", {
                method: "POST",
                body: formData,
              });

              if (!result.ok) {
                const body = (await result.json()) as { error?: string };
                setError(body.error ?? "Falha ao importar arquivo.");
                return;
              }

              setResponse((await result.json()) as ImportResponse);
              router.refresh();
            });
          }}
        >
          <Input accept=".csv" name="file" required type="file" />
          <Button disabled={isPending} type="submit">
            {isPending ? "Importando..." : "Enviar CSV"}
          </Button>
        </form>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {response ? (
          <div className="space-y-4">
            <Alert variant="success">
              {response.acceptedCount} registro(s) aceito(s) e {response.rejected.length} rejeitado(s).
            </Alert>
            {response.rejected.length > 0 ? (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <TableHeadCell>Linha</TableHeadCell>
                      <TableHeadCell>Motivo</TableHeadCell>
                      <TableHeadCell>Conteudo</TableHeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {response.rejected.map((row) => (
                      <tr key={`${row.rowNumber}-${row.error}`}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.error}</TableCell>
                        <TableCell>{row.raw.join(" | ")}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
