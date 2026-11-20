import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { tabelaUsuarios } from "@/mocks/authStore";
import { verifyPassword } from "./password";
import { registrarUsuario } from "./registration";

const registeredEmails: string[] = [];

afterEach(() => {
  for (const email of registeredEmails.splice(0)) {
    const index = tabelaUsuarios.findIndex((user) => user.email === email);
    if (index >= 0) tabelaUsuarios.splice(index, 1);
  }
});

function registrationData(email: string) {
  return {
    nome: "Pessoa de Teste",
    cpf: "111.444.777-35",
    telefone: "+55 (81) 98765-4321",
    cargo: "Administradora",
    nomeEmpresa: "Empresa de Teste",
    razaoSocial: "Empresa de Teste Ltda.",
    cnpj: "11.222.333/0001-81",
    segmento: "Transporte",
    tipoUnidade: "Matriz",
    cep: "50000-000",
    estado: "PE",
    cidade: "Recife",
    bairro: "Centro",
    logradouro: "Rua de Teste",
    numero: "10",
    email,
    senha: "Teste#Senha1234",
    confirmarSenha: "Teste#Senha1234",
    aceiteTermos: true,
    website: "",
  };
}

describe("registro de usuário", () => {
  it("salva o cadastro completo no authStore com senha protegida para login", async () => {
    const email = `cadastro-${randomUUID()}@example.com`;
    const result = await registrarUsuario(registrationData(email));
    registeredEmails.push(email);

    expect(result).toEqual({ success: true });

    const user = tabelaUsuarios.find((item) => item.email === email);
    expect(user).toMatchObject({
      nome: "Pessoa de Teste",
      email,
      nomeEmpresa: "Empresa de Teste",
      cidade: "Recife",
    });
    expect(user?.senhaHash).not.toBe("Teste#Senha1234");
    expect(await verifyPassword("Teste#Senha1234", user!.senhaHash)).toBe(true);
    expect(await verifyPassword("senha-errada", user!.senhaHash)).toBe(false);
  });

  it("rejects duplicated email addresses", async () => {
    const email = `duplicado-${randomUUID()}@example.com`;
    const first = await registrarUsuario(registrationData(email));
    registeredEmails.push(email);
    const second = await registrarUsuario(registrationData(email));

    expect(first).toEqual({ success: true });
    expect(second).toMatchObject({
      success: false,
      status: 409,
    });
  });

  it("rejects incomplete or bot-submitted registration data", async () => {
    const incomplete = await registrarUsuario({ email: "incompleto@example.com" });
    const botSubmission = await registrarUsuario({
      ...registrationData(`bot-${randomUUID()}@example.com`),
      website: "spam",
    });

    expect(incomplete).toMatchObject({ success: false, status: 400 });
    expect(botSubmission).toMatchObject({ success: false, status: 400 });
  });

  it("continues accepting legacy plaintext mock passwords", async () => {
    expect(await verifyPassword("legacy-demo-password", "legacy-demo-password")).toBe(
      true,
    );
  });
});
