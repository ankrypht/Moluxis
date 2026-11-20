/**
 * Normalizes a compound name for consistent case-insensitive comparison,
 * deduplication, and cache indexing.
 */
export function normalizeCompoundName(name?: string | null): string {
  if (!name) return "";
  return name.trim().toLowerCase();
}
