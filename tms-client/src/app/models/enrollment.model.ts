export type EnrollmentStatus = "Pending" | "Approved" | "Rejected";

export interface Enrollment {
  id: number;
  studentName: string;
  courseName: string;
  status: EnrollmentStatus;
}
