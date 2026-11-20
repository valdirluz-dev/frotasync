import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import { buscarUsuarioPorEmail, atualizarSenhaUsuario } from "@/mocks/authStore";
import { hashPassword } from "@/lib/auth/password";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

type RecoveryCode = {
  userId: string;
  salt: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
};

type ResetToken = { userId: string; expiresAt: number };

const recoveryCodes = new Map<string, RecoveryCode>();
const resetTokens = new Map<string, ResetToken>();
const requestTimestamps = new Map<string, number>();

function hashCode(code: string, salt: string) {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function sameHash(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

export async function solicitarCodigoRecuperacao(
  email: string,
  deliverCode: (email: string, code: string) => void = (to, code) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mock-email] Código de recuperação para ${to}: ${code}`);
    }
  },
) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const previousRequest = requestTimestamps.get(normalizedEmail);
  if (previousRequest && now - previousRequest < RESEND_INTERVAL_MS) {
    return { success: false as const, status: 429 };
  }
  requestTimestamps.set(normalizedEmail, now);

  const user = buscarUsuarioPorEmail(normalizedEmail);
  if (user) {
    const code = String(randomInt(0, 100_000)).padStart(5, "0");
    const salt = randomBytes(16).toString("hex");
    recoveryCodes.set(normalizedEmail, {
      userId: user.id,
      salt,
      codeHash: hashCode(code, salt),
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
    });
    deliverCode(normalizedEmail, code);
  }

  return { success: true as const };
}

export function verificarCodigoRecuperacao(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const recovery = recoveryCodes.get(normalizedEmail);
  const now = Date.now();

  if (!recovery || recovery.expiresAt <= now) {
    recoveryCodes.delete(normalizedEmail);
    return { success: false as const };
  }
  if (recovery.attempts >= MAX_CODE_ATTEMPTS) {
    recoveryCodes.delete(normalizedEmail);
    return { success: false as const };
  }

  recovery.attempts += 1;
  if (!sameHash(hashCode(code, recovery.salt), recovery.codeHash)) {
    return { success: false as const };
  }

  recoveryCodes.delete(normalizedEmail);
  const token = randomBytes(32).toString("base64url");
  resetTokens.set(token, {
    userId: recovery.userId,
    expiresAt: now + RESET_TOKEN_TTL_MS,
  });
  return { success: true as const, token };
}

export async function redefinirSenhaComToken(token: string, password: string) {
  const reset = resetTokens.get(token);
  if (!reset || reset.expiresAt <= Date.now()) {
    resetTokens.delete(token);
    return false;
  }

  const passwordHash = await hashPassword(password);
  const updated = atualizarSenhaUsuario(reset.userId, passwordHash);
  resetTokens.delete(token);
  return updated;
}
