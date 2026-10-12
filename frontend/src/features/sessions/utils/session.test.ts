import { describe, expect, it } from "vitest";
import { parseSessionKey } from "./session.ts";

describe("parseSessionKey", () => {
  it("parses positive integers", () => {
    expect(parseSessionKey("9161")).toBe(9161);
  });

  it.each([undefined, "", "abc", "0", "-1", "1.5", "1e3", "1234567890"])(
    "rejects %s",
    (raw) => expect(parseSessionKey(raw)).toBeNull(),
  );
});
