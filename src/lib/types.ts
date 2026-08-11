export type DateSource = "explicit" | "estimated";

export type Seminar = {
  id: string;
  collegeName: string;
  statusRaw: string;
  dateRaw: string;
  date: Date | null;
  dateSource: DateSource | null;
  streams: string[];
  noOfStudents: string;
  walkIns: string;
  lockIns: string;
  bdm: string;
  speaker: string;
  closestBranch: string;
  /** From the separate calling sheet, matched by college/stream. 0 matchCount means no calling data available (not that the seminar has 0 prospects). */
  callingMatchCount: number;
  callingProspects: number;
  callingFutureIntake: number;
};
