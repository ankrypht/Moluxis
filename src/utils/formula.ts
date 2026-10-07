/**
 * Chemical formula formatting utilities.
 */

export const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

/**
 * Formats a chemical formula string (e.g. "H2O", "C8H10N4O2", "Ca(OH)2") by converting
 * numeric digits to Unicode subscript characters (e.g. "H₂O", "C₈H₁₀N₄O₂", "Ca(OH)₂").
 * Handles null, undefined, and empty string safely.
 */
export const formatSubscriptFormula = (formula?: string | null): string => {
  if (!formula) return "";
  return formula.replace(/\d/g, (digit) => SUBSCRIPT_MAP[digit] || digit);
};
