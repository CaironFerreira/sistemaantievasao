import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppFrame } from "@/components/layout/app-frame";
import { getSession } from "@/lib/auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session?.user?.id || !session.user.active) {
    redirect("/login");
  }

  return (
    <AppFrame role={session.user.role} userName={session.user.name ?? session.user.email ?? "Usuario"}>
      {children}
    </AppFrame>
  );
}
