const PALETTE = [
  { dot: "#2563eb", bg: "#eff6ff", text: "#1e40af", ring: "#bfdbfe" }, // blue
  { dot: "#16a34a", bg: "#f0fdf4", text: "#15803d", ring: "#bbf7d0" }, // green
  { dot: "#d97706", bg: "#fffbeb", text: "#b45309", ring: "#fde68a" }, // amber
  { dot: "#db2777", bg: "#fdf2f8", text: "#be185d", ring: "#fbcfe8" }, // pink
  { dot: "#7c3aed", bg: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe" }, // violet
  { dot: "#0891b2", bg: "#ecfeff", text: "#0e7490", ring: "#a5f3fc" }, // cyan
  { dot: "#dc2626", bg: "#fef2f2", text: "#b91c1c", ring: "#fecaca" }, // red
  { dot: "#65a30d", bg: "#f7fee7", text: "#4d7c0f", ring: "#d9f99d" }, // lime
  { dot: "#ea580c", bg: "#fff7ed", text: "#c2410c", ring: "#fed7aa" }, // orange
  { dot: "#4f46e5", bg: "#eef2ff", text: "#4338ca", ring: "#c7d2fe" }, // indigo
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function colorForStream(stream: string) {
  const key = stream.trim().toLowerCase() || "unspecified";
  return PALETTE[hashString(key) % PALETTE.length];
}
