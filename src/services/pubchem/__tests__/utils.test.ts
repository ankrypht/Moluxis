import { isValidId, isAbortError } from "../utils";

describe("isValidId", () => {
  it("should return true for valid numeric strings", () => {
    expect(isValidId("12345")).toBe(true);
    expect(isValidId("1")).toBe(true);
  });

  it("should return true for valid numbers", () => {
    expect(isValidId(12345)).toBe(true);
    expect(isValidId(1)).toBe(true);
  });

  it("should return false for strings with non-numeric characters", () => {
    expect(isValidId("123a")).toBe(false);
    expect(isValidId("abc")).toBe(false);
    expect(isValidId("12.3")).toBe(false);
    expect(isValidId("12 3")).toBe(false);
  });

  it("should return false for negative numbers or zero", () => {
    expect(isValidId("-123")).toBe(false);
    expect(isValidId("0")).toBe(false);
    expect(isValidId(0)).toBe(false);
    expect(isValidId(-1)).toBe(false);
  });

  it("should return false for null, undefined, or empty strings", () => {
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId("")).toBe(false);
    expect(isValidId("   ")).toBe(false);
  });

  it("should return false for malicious strings (potential path traversal/injection)", () => {
    expect(isValidId("../etc/passwd")).toBe(false);
    expect(isValidId("123/../../")).toBe(false);
    expect(isValidId("123.html")).toBe(false);
    expect(isValidId("123?query=1")).toBe(false);
    expect(isValidId("123#fragment")).toBe(false);
  });
});

describe("isAbortError", () => {
  it("should return true when signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();
    expect(isAbortError(new Error("any error"), controller.signal)).toBe(true);
  });

  it("should return true for AbortError by name", () => {
    const error = new Error("aborted");
    error.name = "AbortError";
    expect(isAbortError(error)).toBe(true);
  });

  it("should return true for cancellation error messages (e.g. React Native / Fetch request has been canceled)", () => {
    const error = new Error("fetch failed: Fetch request has been canceled");
    expect(isAbortError(error)).toBe(true);
  });

  it("should return false for regular errors", () => {
    const error = new Error("Network connection lost");
    expect(isAbortError(error)).toBe(false);
    expect(isAbortError("some string error")).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});
