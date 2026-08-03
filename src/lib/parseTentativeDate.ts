const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const WEEK_QUALIFIERS: Record<string, number | "last"> = {
  "1st": 1, first: 1,
  "2nd": 2, second: 2,
  "3rd": 3, third: 3,
  "4th": 4, fourth: 4,
  last: "last",
};

const MONTH_WEEK_RE = new RegExp(
  `(${Object.keys(MONTHS).join("|")})[a-z]*\\s+(${Object.keys(WEEK_QUALIFIERS).join("|")})\\s*week`,
  "i"
);

/**
 * The sheet's status column carries free text like "August 1st week" or
 * "Sep last week" for seminars that don't have a confirmed date yet. We take
 * the *last* calendar day of that week-of-month as a placeholder date so the
 * seminar can still be plotted on the calendar (marked as tentative).
 */
export function parseTentativeDate(raw: string, referenceDate: Date = new Date()): Date | null {
  const match = raw.match(MONTH_WEEK_RE);
  if (!match) return null;

  const monthIndex = MONTHS[match[1].toLowerCase()];
  const weekQualifier = WEEK_QUALIFIERS[match[2].toLowerCase()];

  let year = referenceDate.getFullYear();
  if (monthIndex < referenceDate.getMonth()) {
    year += 1;
  }

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const day = weekQualifier === "last" ? daysInMonth : Math.min(weekQualifier * 7, daysInMonth);

  return new Date(year, monthIndex, day);
}
