import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  adicionarUsuario,
  buscarUsuarioPorEmail,
  tabelaUsuarios,
  type UsuarioRegistro,
} from "@/mocks/authStore";
import { verifyPassword } from "@/lib/auth/password";
import {
  redefinirSenhaComToken,
  solicitarCodigoRecuperacao,
  verificarCodigoRecuperacao,
} from "./passwordRecovery";

const createdEmails: string[] = [];

function addUser(email: string): UsuarioRegistro {
  const user: UsuarioRegistro = {
    id: `test-${randomUUID()}`,
    nome: "Pessoa de Teste",
    cpf: "111.444.777-35",
    telefone: "+55 81 99999-9999",
    cargo: "Administradora",
    email,
    senhaHash: "SenhaAntiga#123",
    nomeEmpresa: "Empresa Teste",
    razaoSocial: "Empresa Teste Ltda.",
    cnpj: "11.222.333/0001-81",
    segmento: "Transporte",
    tipoUnidade: "Matriz",
    cep: "50000-000",
    estado: "PE",
    cidade: "Recife",
    bairro: "Centro",
    logradouro: "Rua Teste",
    numero: "1",
    criadoEm: "2026-01-01",
  };
  expect(adicionarUsuario(user)).toBe(true);
  createdEmails.push(email);
  return user;
}

afterEach(() => {
  for (const email of createdEmails.splice(0)) {
    const index = tabelaUsuarios.findIndex((user) => user.email === email);
    if (index >= 0) tabelaUsuarios.splice(index, 1);
  }
  vi.restoreAllMocks();
});

describe("password recovery", () => {
  it("verifies a recovery code and changes the stored password exactly once", async () => {
    const email = `reset-${randomUUID()}@example.com`;
    const user = addUser(email);
    let deliveredCode = "";

    await expect(
      solicitarCodigoRecuperacao(email, (_address, code) => {
        deliveredCode = code;
      }),
    ).resolves.toEqual({ success: true });

    expect(deliveredCode).toMatch(/^\d{5}$/);
    const incorrectCode = deliveredCode === "00000" ? "00001" : "00000";
    expect(verificarCodigoRecuperacao(email, incorrectCode)).toEqual({
      success: false,
    });

    const verification = verificarCodigoRecuperacao(email, deliveredCode);
    expect(verification.success).toBe(true);
    if (!verification.success) throw new Error("Expected verification success");

    expect(
      await redefinirSenhaComToken(verification.token, "NovaSenha#2026"),
    ).toBe(true);
    expect(
      await verifyPassword(
        "NovaSenha#2026",
        buscarUsuarioPorEmail(email)!.senhaHash,
      ),
    ).toBe(true);
    expect(
      await verifyPassword("SenhaAntiga#123", user.senhaHash),
    ).toBe(false);
    expect(
      await redefinirSenhaComToken(verification.token, "OutraSenha#2026"),
    ).toBe(false);
  });

  it("returns a generic success for addresses without an account", async () => {
    const delivered = vi.fn();
    const email = `unknown-${randomUUID()}@example.com`;

    await expect(
      solicitarCodigoRecuperacao(email, delivered),
    ).resolves.toEqual({ success: true });
    expect(delivered).not.toHaveBeenCalled();
    expect(verificarCodigoRecuperacao(email, "12345")).toEqual({
      success: false,
    });
  });

  it("limits repeated code requests", async () => {
    const user = addUser(`resend-${randomUUID()}@example.com`);
    const deliver = vi.fn();

    await expect(
      solicitarCodigoRecuperacao(user.email, deliver),
    ).resolves.toEqual({ success: true });
    await expect(
      solicitarCodigoRecuperacao(user.email, deliver),
    ).resolves.toEqual({ success: false, status: 429 });
    expect(deliver).toHaveBeenCalledTimes(1);
  });
});
