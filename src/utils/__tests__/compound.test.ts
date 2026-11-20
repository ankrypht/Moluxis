import { normalizeCompoundName } from "../compound";

describe("compound utilities", () => {
  describe("normalizeCompoundName", () => {
    it("trims whitespace and converts to lowercase", () => {
      expect(normalizeCompoundName("  Caffeine  ")).toBe("caffeine");
      expect(normalizeCompoundName("ASPIRIN")).toBe("aspirin");
      expect(normalizeCompoundName("water")).toBe("water");
    });

    it("handles null and undefined gracefully", () => {
      expect(normalizeCompoundName(null)).toBe("");
      expect(normalizeCompoundName(undefined)).toBe("");
      expect(normalizeCompoundName("")).toBe("");
    });
  });
});
