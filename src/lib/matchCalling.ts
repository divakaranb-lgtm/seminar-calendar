import type { CallingRecord } from "./fetchCallingSheet";
import type { Seminar } from "./types";

const STOPWORDS = new Set(["of", "the", "and", "for", "seminar"]);

function compact(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** "Bangalore Inst of Tech" -> "bit" (first letter of each significant word). */
function acronymOf(text: string): string {
  return text
    .split(/[\s_]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()))
    .map((w) => w[0]?.toLowerCase() ?? "")
    .join("");
}

/** "Bangalore Inst of Tech_Civil Seminar" -> { collegePart: "Bangalore Inst of Tech", streamPart: "Civil" } */
function splitInstitute(institute: string): { collegePart: string; streamPart: string } {
  const [collegePart, ...rest] = institute.split("_");
  const streamPart = rest.join("_").replace(/seminar/i, "").trim();
  return { collegePart: (collegePart || "").trim(), streamPart };
}

/**
 * The calling sheet identifies colleges by a shorthand ("Bangalore Inst of
 * Tech") that doesn't exactly match the main sheet's college name, which is
 * sometimes itself an acronym ("BIT", "DSCE"). Matches on substring overlap
 * either direction, or an acronym derived from one being a prefix of the
 * other.
 */
function collegeMatches(collegeName: string, collegePart: string): boolean {
  const a = collegeName.toLowerCase().trim();
  const b = collegePart.toLowerCase().trim();
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;

  const compactA = compact(collegeName);
  const compactB = compact(collegePart);
  const acronymA = acronymOf(collegeName);
  const acronymB = acronymOf(collegePart);

  if (acronymB && (compactA === acronymB || compactA.startsWith(acronymB))) return true;
  if (acronymA && (compactB === acronymA || compactB.startsWith(acronymA))) return true;

  return false;
}

function streamMatches(streams: string[], streamPart: string): boolean {
  if (streams.length === 0 || !streamPart) return true;
  const b = compact(streamPart);
  return streams.some((s) => {
    const a = compact(s);
    return a.includes(b) || b.includes(a);
  });
}

export type CallingStats = {
  matchCount: number;
  prospects: number;
  futureIntake: number;
};

/**
 * The calling sheet only tracks students from completed ("Done") sessions -
 * matching is restricted to those so a coincidental college/stream overlap
 * can never attribute calling data to a seminar that hasn't happened yet.
 */
export function computeCallingStats(seminar: Seminar, records: CallingRecord[]): CallingStats {
  if (seminar.statusRaw.trim().toLowerCase() !== "done") {
    return { matchCount: 0, prospects: 0, futureIntake: 0 };
  }

  const matched = records.filter((record) => {
    const { collegePart, streamPart } = splitInstitute(record.institute);
    return collegeMatches(seminar.collegeName, collegePart) && streamMatches(seminar.streams, streamPart);
  });

  const prospects = matched.filter((r) => r.status.toLowerCase() === "prospect").length;
  const futureIntake = matched.filter((r) => r.status.toLowerCase() === "future intake").length;

  return { matchCount: matched.length, prospects, futureIntake };
}

export function enrichWithCallingStats(seminars: Seminar[], records: CallingRecord[]): Seminar[] {
  return seminars.map((seminar) => {
    const stats = computeCallingStats(seminar, records);
    return {
      ...seminar,
      callingMatchCount: stats.matchCount,
      callingProspects: stats.prospects,
      callingFutureIntake: stats.futureIntake,
    };
  });
}
