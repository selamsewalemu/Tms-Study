import { Temporal } from "@js-temporal/polyfill";

// Exercise 2: Define the frontend Student domain model.
export interface Student {
  readonly id: string;
  name: string;
  enrollmentDate: Temporal.Instant;
  gpa?: number;
}

// Exercise 3: Narrow unknown API data to a valid Student shape.
export function isStudent(value: unknown): value is Student {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const objectValue = value as Record<string, unknown>;
  return (
    typeof objectValue.id === "string" &&
    typeof objectValue.name === "string"
  );
}

// Exercise 3 Part B: Parse API data or throw a descriptive error.
export function parseStudent(raw: unknown): Student {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError(
      `Expected an object, received ${raw === null ? "null" : typeof raw}`,
    );
  }

  const objectValue = raw as Record<string, unknown>;
  if (typeof objectValue.id !== "string") {
    throw new TypeError(
      `Expected id to be a string, received ${typeof objectValue.id}`,
    );
  }

  if (typeof objectValue.name !== "string") {
    throw new TypeError(
      `Expected name to be a string, received ${typeof objectValue.name}`,
    );
  }

  return {
    id: objectValue.id,
    name: objectValue.name,
    enrollmentDate: Temporal.Now.instant(),
  };
}
