/**
 * Validates if a given ID (CID or COD ID) is a valid positive integer.
 * This helps prevent URL manipulation and path traversal vulnerabilities.
 */
export const isValidId = (id: string | number | null | undefined): boolean => {
  if (id === null || id === undefined) return false;
  const idStr = id.toString().trim();
  if (idStr === "") return false;
  // Check if it consists only of digits and is not just zero
  return /^\d+$/.test(idStr) && parseInt(idStr, 10) > 0;
};
