"use client";

import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppFrameProps = {
  role: Role;
  userName: string;
  children: ReactNode;
};

export function AppFrame({ role, userName, children }: AppFrameProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
      <Sidebar pathname={pathname} role={role} />
      <div className="space-y-6">
        <Topbar userName={userName} />
        <div className="pb-10">{children}</div>
      </div>
    </div>
  );
}
