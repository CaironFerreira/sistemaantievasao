export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Pagina nao encontrada</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          O recurso solicitado nao existe ou foi movido no painel institucional.
        </p>
      </div>
    </main>
  );
}
