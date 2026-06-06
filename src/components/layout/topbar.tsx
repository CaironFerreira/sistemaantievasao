"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function Topbar({ userName }: { userName: string }) {
  return (
    <div className="flex items-center justify-between rounded-[2rem] border border-border bg-card px-6 py-4 shadow-soft">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Monitoramento Ativo
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{userName}</p>
      </div>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
