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

const MONTH_PATTERN = Object.keys(MONTHS).join("|");
const WEEK_QUALIFIER_PATTERN = Object.keys(WEEK_QUALIFIERS).join("|");

// "August 1st week", "Sep last week"
const MONTH_THEN_WEEK_RE = new RegExp(
  `(${MONTH_PATTERN})[a-z]*\\s+(${WEEK_QUALIFIER_PATTERN})\\s*week`,
  "i"
);
// "2nd week of Aug", "last week of September"
const WEEK_THEN_MONTH_RE = new RegExp(
  `(${WEEK_QUALIFIER_PATTERN})\\s*week\\s+of\\s+(${MONTH_PATTERN})[a-z]*`,
  "i"
);
// "August 13", "Aug 20th", "August 17th-21st" (takes the first day mentioned)
const MONTH_DAY_RE = new RegExp(
  `(${MONTH_PATTERN})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`,
  "i"
);

function inferYear(monthIndex: number, referenceDate: Date): number {
  let year = referenceDate.getFullYear();
  if (monthIndex < referenceDate.getMonth()) year += 1;
  return year;
}

function lastDateOfWeekOfMonth(
  monthIndex: number,
  weekQualifier: number | "last",
  referenceDate: Date
): Date {
  const year = inferYear(monthIndex, referenceDate);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const day = weekQualifier === "last" ? daysInMonth : Math.min(weekQualifier * 7, daysInMonth);
  return new Date(year, monthIndex, day);
}

/**
 * The sheet doesn't always have a real date. It might instead have free
 * text like "August 1st week", "2nd week of Aug", or "August 13 or 14th"
 * (in either the status column or the date column, depending on how the
 * sheet is organized at the time). We take a best-guess placeholder date —
 * the *last* day of a referenced week-of-month, or the specific day
 * mentioned — so the seminar can still be plotted on the calendar, marked
 * as estimated rather than confirmed.
 */
export function parseTentativeDate(raw: string, referenceDate: Date = new Date()): Date | null {
  let match = raw.match(MONTH_THEN_WEEK_RE);
  if (match) {
    const monthIndex = MONTHS[match[1].toLowerCase()];
    const weekQualifier = WEEK_QUALIFIERS[match[2].toLowerCase()];
    return lastDateOfWeekOfMonth(monthIndex, weekQualifier, referenceDate);
  }

  match = raw.match(WEEK_THEN_MONTH_RE);
  if (match) {
    const weekQualifier = WEEK_QUALIFIERS[match[1].toLowerCase()];
    const monthIndex = MONTHS[match[2].toLowerCase()];
    return lastDateOfWeekOfMonth(monthIndex, weekQualifier, referenceDate);
  }

  match = raw.match(MONTH_DAY_RE);
  if (match) {
    const monthIndex = MONTHS[match[1].toLowerCase()];
    const year = inferYear(monthIndex, referenceDate);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const day = Math.min(Math.max(parseInt(match[2], 10), 1), daysInMonth);
    return new Date(year, monthIndex, day);
  }

  return null;
}
