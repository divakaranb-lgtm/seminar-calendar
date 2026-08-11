/**
 * Status text is free-form and shown verbatim in the UI. This only adds a
 * color hint for a few common keywords; anything unrecognized (a week
 * reference, "yet to confirm", a future status word we don't know about
 * yet) just gets a neutral tint instead of guessing at its meaning.
 */
export function statusTint(statusRaw: string): string {
  const s = statusRaw.toLowerCase();
  // Checked first: "yet to confirm" contains the substring "confirm" and
  // would otherwise be misread as a positive/green status below.
  if (s.includes("yet to confirm") || s.includes("not confirm")) {
    return "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300";
  }
  if (s.includes("cancel")) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  if (s.includes("postpon")) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
  }
  if (s.includes("final") || s.includes("confirm") || s.includes("done")) {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }
  return "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300";
}
