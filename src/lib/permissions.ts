import type { Role } from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ACOMPANHAMENTO: "Acompanhamento",
  LEITURA: "Leitura",
};

export const roleCapabilities = {
  ADMIN: [
    "dashboard:read",
    "reports:read",
    "alerts:read",
    "alerts:manage",
    "followup:manage",
    "institutions:manage",
    "students:manage",
    "imports:manage",
    "risk-rules:manage",
    "users:manage",
  ],
  GESTOR: ["dashboard:read", "reports:read", "alerts:read", "followup:manage"],
  ACOMPANHAMENTO: ["dashboard:read", "alerts:read", "followup:manage", "reports:read"],
  LEITURA: ["dashboard:read", "reports:read", "alerts:read"],
} as const satisfies Record<Role, string[]>;

export type Capability = (typeof roleCapabilities)[Role][number];

export function hasCapability(role: Role, capability: string) {
  return (roleCapabilities[role] as readonly string[]).includes(capability);
}

export function requireCapability(role: Role, capability: string) {
  if (!hasCapability(role, capability)) {
    throw new Error("FORBIDDEN");
  }
}

export function isAdministrativeRole(role: Role) {
  return role === "ADMIN";
}
