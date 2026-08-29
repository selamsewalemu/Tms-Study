export interface GradeSubmissionPayload {
  studentId: number;
  courseCode: string;
  grade: number;
  submittedBy: string;
}

export interface GradeSubmissionResult {
  studentId: number;
  courseCode: string;
  grade: number;
  submittedBy: string;
  message: string;
}
