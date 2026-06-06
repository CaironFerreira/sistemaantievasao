import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { getAggregateReports } from "@/server/services/report-service";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !hasCapability(session.user.role, "reports:read")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const url = new URL(request.url);
  const response = await getAggregateReports({
    unitId: url.searchParams.get("unitId") ?? undefined,
    courseId: url.searchParams.get("courseId") ?? undefined,
    classGroupId: url.searchParams.get("classGroupId") ?? undefined,
    period: url.searchParams.get("period") ?? undefined,
  });

  return NextResponse.json(response);
}
