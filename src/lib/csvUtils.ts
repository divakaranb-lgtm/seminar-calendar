/** Finds a column key by fuzzy (case-insensitive substring) match against a list of candidate needles, in priority order. */
export function findKey(
  row: Record<string, string>,
  needles: string[],
  exclude: Set<string> = new Set()
): string {
  const keys = Object.keys(row).filter((k) => !exclude.has(k));
  for (const needle of needles) {
    const found = keys.find((k) => k.toLowerCase().includes(needle));
    if (found) return found;
  }
  return "";
}
