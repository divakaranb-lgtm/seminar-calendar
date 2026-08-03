export type SeminarStatus = "finalised" | "tentative" | "unscheduled";

export type Seminar = {
  id: string;
  collegeName: string;
  status: SeminarStatus;
  statusRaw: string;
  dateRaw: string;
  date: Date | null;
  streams: string[];
  noOfStudents: string;
  bdm: string;
  speaker: string;
  closestBranch: string;
};
