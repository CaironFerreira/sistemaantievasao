import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.24),_transparent_28%)] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-slate-950 px-10 py-12 text-slate-100 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Permanencia Estudantil
          </p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight">
            Monitoramento institucional com resposta rapida aos sinais de evasao.
          </h1>
          <p className="mt-6 max-w-lg text-base text-slate-300">
            Centralize dados academicos, gere alertas priorizados e acompanhe
            intervencoes com rastreabilidade.
          </p>
        </div>
        <div className="grid gap-4 rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-300">
            MVP focado em importacao CSV, regras configuraveis, alertas
            deduplicados, casos e relatorios gerenciais.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-slate-800 p-4">RBAC por perfil</div>
            <div className="rounded-2xl bg-slate-800 p-4">Auditoria critica</div>
            <div className="rounded-2xl bg-slate-800 p-4">Dashboard tatico</div>
            <div className="rounded-2xl bg-slate-800 p-4">Acompanhamento</div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        {children}
      </section>
    </main>
  );
}
