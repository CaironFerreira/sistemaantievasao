import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";
import { processCsvImport } from "@/server/services/import-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !hasCapability(session.user.role, "imports:manage")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao informado." }, { status: 400 });
  }

  try {
    const response = await processCsvImport(await file.text(), session.user.id);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha na importacao.",
      },
      { status: 400 },
    );
  }
}
