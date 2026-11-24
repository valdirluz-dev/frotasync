import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_NAME } from "./session";

describe("sessão autenticada", () => {
  it("usa o indicador de sessão definido pelo contrato", () => {
    expect(SESSION_COOKIE_NAME).toBe("frotasync_session");
  });
});
