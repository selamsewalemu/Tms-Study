import { Temporal } from "@js-temporal/polyfill";

// Exercise 2: Define the frontend Course domain model.
export interface Course {
  readonly id: string;
  title: string;
  capacity: number;
  startDate?: Temporal.PlainDate;
}

// Exercise 5 Part B: Model every course lifecycle state explicitly.
export type CourseStatus =
  | { status: "DRAFT"; createdBy: string; createdAt: Temporal.Instant }
  | {
      status: "PUBLISHED";
      publishedAt: Temporal.Instant;
      syllabus: string;
    }
  | {
      status: "ACTIVE";
      enrolledCount: number;
      startDate: Temporal.PlainDate;
    }
  | {
      status: "ARCHIVED";
      archivedAt: Temporal.Instant;
      finalEnrollmentCount: number;
    }
  | { status: "CANCELLED"; reason: string; cancelledAt: Temporal.Instant };

// Exercise 5 Part B: Describe all course states with an exhaustive switch.
export function describeCourse(course: CourseStatus): string {
  switch (course.status) {
    case "DRAFT":
      return `Draft created by ${course.createdBy}`;
    case "PUBLISHED":
      return `Published with syllabus: ${course.syllabus}`;
    case "ACTIVE":
      return `Active with ${course.enrolledCount} students since ${course.startDate}`;
    case "ARCHIVED":
      return `Archived with ${course.finalEnrollmentCount} enrollments`;
    case "CANCELLED":
      return `Cancelled: ${course.reason}`;
    default: {
      const check: never = course;
      throw new Error(`Unhandled course status: ${JSON.stringify(check)}`);
    }
  }
}
