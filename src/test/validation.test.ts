import { describe, it, expect } from "vitest";
import { passwordError, usernameError } from "@/lib/validation";

describe("password rules", () => {
  it("rejects under 8 chars", () => expect(passwordError("abc123")).not.toBeNull());
  it("rejects letters only", () => expect(passwordError("abcdefgh")).not.toBeNull());
  it("rejects numbers only", () => expect(passwordError("12345678")).not.toBeNull());
  it("accepts 8+ with letters and numbers", () => expect(passwordError("huerta12")).toBeNull());
});

describe("username rules", () => {
  it("rejects spaces", () => expect(usernameError("juan diaz")).not.toBeNull());
  it("accepts simple handle", () => expect(usernameError("juan_diaz")).toBeNull());
});
