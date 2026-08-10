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
  prospects: string;
  walkIns: string;
  lockIns: string;
  bdm: string;
  speaker: string;
  closestBranch: string;
};
