import { isValidId } from "../utils";

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
