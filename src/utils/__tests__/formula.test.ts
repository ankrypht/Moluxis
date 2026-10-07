import { formatSubscriptFormula, SUBSCRIPT_MAP } from "../formula";

describe("formatSubscriptFormula", () => {
  it("converts single digits into subscript unicode characters", () => {
    expect(formatSubscriptFormula("H2O")).toBe("H₂O");
    expect(formatSubscriptFormula("CO2")).toBe("CO₂");
    expect(formatSubscriptFormula("O2")).toBe("O₂");
  });

  it("converts multi-digit numbers correctly", () => {
    expect(formatSubscriptFormula("C8H10N4O2")).toBe("C₈H₁₀N₄O₂");
    expect(formatSubscriptFormula("C20H24N2O2")).toBe("C₂₀H₂₄N₂O₂");
  });

  it("leaves formulas with no digits unchanged", () => {
    expect(formatSubscriptFormula("NaCl")).toBe("NaCl");
    expect(formatSubscriptFormula("HCl")).toBe("HCl");
    expect(formatSubscriptFormula("C")).toBe("C");
  });

  it("handles parentheses and special characters properly", () => {
    expect(formatSubscriptFormula("Ca(OH)2")).toBe("Ca(OH)₂");
    expect(formatSubscriptFormula("Fe2(SO4)3")).toBe("Fe₂(SO₄)₃");
  });

  it("handles empty or null/undefined inputs safely", () => {
    expect(formatSubscriptFormula("")).toBe("");
    expect(formatSubscriptFormula(null)).toBe("");
    expect(formatSubscriptFormula(undefined)).toBe("");
  });

  it("converts all digits from 0 to 9", () => {
    const allDigits = "0123456789";
    const expected = "₀₁₂₃₄₅₆₇₈₉";
    expect(formatSubscriptFormula(allDigits)).toBe(expected);
    Object.keys(SUBSCRIPT_MAP).forEach((digit) => {
      expect(formatSubscriptFormula(digit)).toBe(SUBSCRIPT_MAP[digit]);
    });
  });
});
