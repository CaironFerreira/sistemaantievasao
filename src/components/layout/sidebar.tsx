import Link from "next/link";
import { BarChart3, Bell, BookOpenCheck, FileSpreadsheet, LayoutDashboard, School2, ShieldCheck, Users } from "lucide-react";
import type { Role } from "@prisma/client";

import { roleLabels, hasCapability } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, capability: "dashboard:read" },
  { href: "/alunos", label: "Alunos", icon: Users, capability: "students:manage" },
  { href: "/importacoes", label: "Importacoes", icon: FileSpreadsheet, capability: "imports:manage" },
  { href: "/alertas", label: "Alertas", icon: Bell, capability: "alerts:read" },
  { href: "/acompanhamentos", label: "Acompanhamentos", icon: BookOpenCheck, capability: "followup:manage" },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3, capability: "reports:read" },
  { href: "/configuracoes/unidades", label: "Estrutura", icon: School2, capability: "institutions:manage" },
  { href: "/configuracoes/usuarios", label: "Usuarios", icon: ShieldCheck, capability: "users:manage" },
] as const;

type SidebarProps = {
  pathname: string;
  role: Role;
};

export function Sidebar({ pathname, role }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-[2rem] bg-slate-950 px-5 py-6 text-slate-100 shadow-soft">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Permanencia</p>
        <h2 className="mt-2 text-xl font-semibold">Gestao Estudantil</h2>
        <p className="mt-3 text-sm text-slate-300">{roleLabels[role]}</p>
      </div>
      <nav className="space-y-2">
        {navigation
          .filter((item) => hasCapability(role, item.capability))
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-slate-100 text-slate-950" : "text-slate-200 hover:bg-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
