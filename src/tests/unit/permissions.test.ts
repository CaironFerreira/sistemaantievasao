import { describe, expect, it } from "vitest";

import { hasCapability, requireCapability } from "@/lib/permissions";

describe("permissions", () => {
  it("permite gestao integral para ADMIN", () => {
    expect(hasCapability("ADMIN", "users:manage")).toBe(true);
    expect(hasCapability("ADMIN", "risk-rules:manage")).toBe(true);
  });

  it("restringe alteracao administrativa para LEITURA", () => {
    expect(hasCapability("LEITURA", "users:manage")).toBe(false);
    expect(() => requireCapability("LEITURA", "users:manage")).toThrow("FORBIDDEN");
  });

  it("permite acompanhamento para equipe operacional", () => {
    expect(hasCapability("ACOMPANHAMENTO", "followup:manage")).toBe(true);
    expect(hasCapability("ACOMPANHAMENTO", "imports:manage")).toBe(false);
  });
});
