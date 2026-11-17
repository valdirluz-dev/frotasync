export const SESSION_COOKIE_NAME = "frotasync_session";

function getSessionSecret() {
  const secret = process.env.FROTASYNC_SESSION_SECRET;
  if (!secret || new TextEncoder().encode(secret).byteLength < 32) {
    return null;
  }

  return secret;
}

export function hasSessionSecret() {
  return getSessionSecret() !== null;
}

function encodeBase64Url(value: string) {
  return encodeBase64UrlBytes(new TextEncoder().encode(value));
}

function encodeBase64UrlBytes(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64UrlBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) =>
    character.charCodeAt(0),
  );
}

function decodeBase64Url(value: string) {
  return new TextDecoder().decode(decodeBase64UrlBytes(value));
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  userId: string,
  maxAgeSeconds: number,
) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      "FROTASYNC_SESSION_SECRET must contain at least 32 characters.",
    );
  }

  const payload = encodeBase64Url(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    }),
  );
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );

  return `${payload}.${encodeBase64UrlBytes(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined) {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const [payload, signature, ...rest] = token.split(".");
  if (
    !payload ||
    !signature ||
    rest.length > 0 ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !/^[A-Za-z0-9_-]+$/.test(signature)
  ) {
    return false;
  }

  try {
    const claims: unknown = JSON.parse(decodeBase64Url(payload));
    if (
      typeof claims !== "object" ||
      claims === null ||
      !("sub" in claims) ||
      typeof claims.sub !== "string" ||
      !claims.sub ||
      !("exp" in claims) ||
      typeof claims.exp !== "number" ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) {
      return false;
    }

    const key = await getSigningKey(secret);
    return crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64UrlBytes(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}
