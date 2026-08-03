export type Seminar = {
  id: string;
  collegeName: string;
  dateRaw: string;
  date: Date | null;
  stream: string;
  noOfStudents: string;
  bdm: string;
  speaker: string;
  closestBranch: string;
};
