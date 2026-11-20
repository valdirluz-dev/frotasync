import { describe, expect, it } from "vitest";

import { isPublicRoute } from "./publicRoutes";

describe("isPublicRoute", () => {
  it.each([
    "/login",
    "/api/auth/login",
    "/cadastro",
    "/cadastro/Dados-Pessoais",
    "/cadastro/Dados-da-Empresa",
    "/cadastro/Dados-de-Login",
    "/cadastro/Sucesso",
    "/recuperar-senha",
    "/recuperar-senha/passo1-email",
    "/recuperar-senha/passo2-cod",
    "/recuperar-senha/passo3-senha",
    "/recuperar-senha/passo4-sucesso",
  ])("allows the public route %s", (pathname) => {
    expect(isPublicRoute(pathname)).toBe(true);
  });

  it.each([
    "/dashboard",
    "/api/auth/logout",
    "/api/auth/other",
    "/cadastro-admin",
    "/recuperar-senha-fake",
  ])("keeps the route protected: %s", (pathname) => {
    expect(isPublicRoute(pathname)).toBe(false);
  });
});
