import { expect, test } from "@playwright/test";

test("fluxo principal do MVP", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@sdd.local");
  await page.getByLabel("Senha").fill("Admin123!");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/importacoes");
  await expect(page.getByText("Importacao CSV")).toBeVisible();

  await page.goto("/alertas");
  await expect(page.getByRole("heading", { name: "Alertas priorizados" })).toBeVisible();

  await page.goto("/acompanhamentos");
  await expect(page.getByRole("heading", { name: "Casos de acompanhamento" })).toBeVisible();

  await page.goto("/relatorios");
  await expect(page.getByRole("heading", { name: "Relatorios" })).toBeVisible();
});
