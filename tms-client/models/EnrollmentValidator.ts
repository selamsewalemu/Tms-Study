// Module 3 Exercise 3: Atomic enrollment-capacity validation example.
import type { Course } from "./course.model.js";

// Exercise 3: Keep enrollment validation as one focused, independently reviewable change.
export function canEnroll(course: Course, enrolledCount: number): boolean {
  return enrolledCount < course.capacity;
}
