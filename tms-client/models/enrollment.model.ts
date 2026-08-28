import { Temporal } from "@js-temporal/polyfill";

// Exercise 2: Define the frontend EnrollmentRecord domain model.
export interface EnrollmentRecord {
  readonly studentId: string;
  readonly courseCode: string;
  enrolledAt: Temporal.Instant;
}

// Exercise 5: Model enrollment as one of five impossible-state-safe variants.
export type EnrollmentStatus =
  | {
      status: "PENDING";
      requestedAt: Temporal.Instant;
      studentId: string;
      courseId: string;
    }
  | {
      status: "APPROVED";
      approvedBy: string;
      approvedAt: Temporal.Instant;
    }
  | {
      status: "ACTIVE";
      startDate: Temporal.PlainDate;
      currentGrade?: number;
    }
  | {
      status: "COMPLETED";
      finalGrade: number;
      completedAt: Temporal.Instant;
    }
  | {
      status: "DROPPED";
      reason: string;
      droppedAt: Temporal.Instant;
    };

// Exercise 5: Describe every enrollment state with an exhaustive switch.
export function describeEnrollment(enrollment: EnrollmentStatus): string {
  switch (enrollment.status) {
    case "PENDING":
      return `Awaiting approval since ${enrollment.requestedAt}`;
    case "APPROVED":
      return `Approved by ${enrollment.approvedBy}`;
    case "ACTIVE":
      return enrollment.currentGrade !== undefined
        ? `In progress grade so far: ${enrollment.currentGrade}`
        : "In progress not yet graded";
    case "COMPLETED":
      return `Finished with ${enrollment.finalGrade}`;
    case "DROPPED":
      return `Dropped: ${enrollment.reason}`;
    default: {
      const check: never = enrollment;
      throw new Error(`Unhandled enrollment status: ${JSON.stringify(check)}`);
    }
  }
}
