import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedPassword: string,
): Promise<boolean> {
  const [algorithm, saltHex, hashHex, ...extra] = storedPassword.split("$");

  if (algorithm !== "scrypt") {
    return !storedPassword.includes("$") && storedPassword === password;
  }
  if (!saltHex || !hashHex || extra.length > 0) {
    return false;
  }

  if (!/^[\da-f]+$/i.test(saltHex) || !/^[\da-f]+$/i.test(hashHex)) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(hashHex, "hex");
  if (expectedKey.length !== KEY_LENGTH) return false;

  const actualKey = await deriveKey(password, salt);
  return timingSafeEqual(actualKey, expectedKey);
}
