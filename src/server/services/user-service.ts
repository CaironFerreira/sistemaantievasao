import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { userSchema, type UserInput } from "@/lib/validators";
import { createPageResult } from "@/server/services/common";
import { createAuditLog } from "@/server/services/audit-service";

const defaultInclude = {
  _count: {
    select: {
      auditLogs: true,
      assignedCases: true,
      interventions: true,
    },
  },
} as const;

export async function listUsers(params: { page?: number; pageSize?: number; search?: string }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: defaultInclude,
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return createPageResult(items, total, page, pageSize);
}

async function ensureLastAdminProtection(
  id: string | undefined,
  nextRole: Role,
  nextActive: boolean,
) {
  if (!id) {
    return;
  }

  const current = await prisma.user.findUnique({ where: { id } });

  if (!current || current.role !== "ADMIN") {
    return;
  }

  if (nextRole === "ADMIN" && nextActive) {
    return;
  }

  const activeAdmins = await prisma.user.count({
    where: {
      role: "ADMIN",
      active: true,
    },
  });

  if (activeAdmins <= 1) {
    throw new Error("Nao e permitido remover privilegio do ultimo ADMIN ativo.");
  }
}

export async function saveUser(
  rawInput: UserInput & { id?: string; password?: string },
  actorId?: string,
) {
  const parsed = userSchema.parse(rawInput);
  await ensureLastAdminProtection(rawInput.id, parsed.role, parsed.active);

  const passwordHash = rawInput.password
    ? await hash(rawInput.password, 10)
    : undefined;

  const result = rawInput.id
    ? await prisma.user.update({
        where: { id: rawInput.id },
        data: {
          name: parsed.name,
          email: parsed.email,
          role: parsed.role,
          active: parsed.active,
          ...(passwordHash ? { passwordHash } : {}),
        },
      })
    : await prisma.user.create({
        data: {
          name: parsed.name,
          email: parsed.email,
          role: parsed.role,
          active: parsed.active,
          passwordHash: passwordHash ?? (await hash("Admin123!", 10)),
        },
      });

  await createAuditLog({
    userId: actorId,
    action: rawInput.id ? "USER_UPDATED" : "USER_CREATED",
    entity: "User",
    entityId: result.id,
    metadata: {
      email: result.email,
      role: result.role,
      active: result.active,
    },
  });

  return result;
}

export async function toggleUserActive(id: string, active: boolean, actorId?: string) {
  const current = await prisma.user.findUnique({ where: { id } });

  if (!current) {
    throw new Error("Usuario nao encontrado.");
  }

  await ensureLastAdminProtection(id, current.role, active);

  const result = await prisma.user.update({
    where: { id },
    data: { active },
  });

  await createAuditLog({
    userId: actorId,
    action: active ? "USER_REACTIVATED" : "USER_DEACTIVATED",
    entity: "User",
    entityId: id,
    metadata: { email: current.email },
  });

  return result;
}
