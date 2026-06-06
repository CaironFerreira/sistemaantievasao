"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="space-y-4 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Falha controlada
        </p>
        <h1 className="text-3xl font-semibold">Nao foi possivel concluir a operacao</h1>
        <p className="text-sm text-muted-foreground">
          Revise os dados informados e tente novamente. O sistema evitou expor
          detalhes sensiveis do erro.
        </p>
        <Button onClick={reset} type="button">
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
