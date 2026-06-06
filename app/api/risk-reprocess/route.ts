import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { reprocessRisk } from "@/server/services/risk-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !hasCapability(session.user.role, "risk-rules:manage")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json()) as { unitId?: string; period?: string };

  if (!body.unitId || !body.period) {
    return NextResponse.json({ error: "unitId e period sao obrigatorios." }, { status: 400 });
  }

  const result = await reprocessRisk(body.unitId, body.period, session.user.id);
  return NextResponse.json({ processed: result.length });
}
