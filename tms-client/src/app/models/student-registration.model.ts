export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export interface StudentRegistration {
  id: string;
  submittedAt: string; // ISO date string

  /* Personal */
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  dateOfBirth: string;
  nationality: string;

  /* Contact */
  email: string;
  phone: string;
  address: string;

  /* Academic */
  desiredProgram: string;
  educationLevel: "High School" | "Bachelor" | "Master" | "Other" | "";
  institution: string;
  graduationYear: string;
  gpa: string;         // GPA for Bachelor/Master/Other
  examScore: string;   // Grade 12 National Exam score for High School

  /* Files (stored as base64 data URLs for localStorage demo) */
  photoDataUrl: string;       // profile photo
  documentDataUrl: string;    // transcript / ID document
  documentName: string;       // original filename

  /* Admin */
  status: RegistrationStatus;
  adminNote: string;
  /** Set when admin approves — used by student to log in */
  username: string;
  generatedPassword: string;
}

export type RegistrationDraft = Omit<StudentRegistration,
  "id" | "submittedAt" | "status" | "adminNote" | "username" | "generatedPassword"
>;
