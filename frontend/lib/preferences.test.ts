import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFERENCES,
  parseAppPreferences,
} from "./preferences";

describe("parseAppPreferences", () => {
  it("uses default preferences when storage is empty or invalid", () => {
    expect(parseAppPreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(parseAppPreferences("{")).toEqual(DEFAULT_PREFERENCES);
  });

  it("preserves dark theme and disabled notification preferences", () => {
    expect(
      parseAppPreferences(
        JSON.stringify({
          theme: "dark",
          notifications: { documento_vencido: false },
        }),
      ),
    ).toEqual({
      theme: "dark",
      notifications: {
        documento_proximo_vencimento: true,
        documento_vencido: false,
        tarefa_pendente: true,
        prazo_tarefa_proximo: true,
      },
    });
  });

  it("normalizes unknown theme values to light", () => {
    expect(
      parseAppPreferences(JSON.stringify({ theme: "unknown" })).theme,
    ).toBe("light");
  });
});
