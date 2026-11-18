import { normalizeCompoundName, areCompoundNamesEqual } from "../compound";

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

  describe("areCompoundNamesEqual", () => {
    it("returns true for matching names regardless of case and surrounding whitespace", () => {
      expect(areCompoundNamesEqual("Ethanol", "  ethanol  ")).toBe(true);
      expect(areCompoundNamesEqual("GLUCOSE", "glucose")).toBe(true);
    });

    it("returns false for different names or empty/null values", () => {
      expect(areCompoundNamesEqual("Ethanol", "Methanol")).toBe(false);
      expect(areCompoundNamesEqual(null, "Ethanol")).toBe(false);
      expect(areCompoundNamesEqual("", "")).toBe(false);
    });
  });
});
