/**
 * Normalizes a compound name for consistent case-insensitive comparison,
 * deduplication, and cache indexing.
 */
export function normalizeCompoundName(name?: string | null): string {
  if (!name) return "";
  return name.trim().toLowerCase();
}

/**
 * Checks whether two compound names match (case-insensitive, trimmed).
 */
export function areCompoundNamesEqual(
  a?: string | null,
  b?: string | null,
): boolean {
  const normA = normalizeCompoundName(a);
  const normB = normalizeCompoundName(b);
  return normA.length > 0 && normA === normB;
}
