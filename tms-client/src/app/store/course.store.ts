import { Injectable, signal } from "@angular/core";
import { EMPTY, catchError } from "rxjs";
import { Course } from "../models/course.model";
import { CourseService } from "../services/course.service";

@Injectable({ providedIn: "root" })
export class CourseStore {
  private readonly courses = signal<Course[]>([
    { id: 1, code: "CS-101", title: "Computer Science Basics", maxCapacity: 30, enrollmentCount: 22 },
    { id: 2, code: "MGT-201", title: "Business Foundations", maxCapacity: 25, enrollmentCount: 19 },
    { id: 3, code: "ENG-110", title: "Communication Skills", maxCapacity: 28, enrollmentCount: 14 },
    { id: 4, code: "DATA-204", title: "Data Visualization", maxCapacity: 24, enrollmentCount: 20 },
  ]);
  private readonly error = signal<string | null>(null);

  readonly entities = this.courses.asReadonly();
  readonly currentError = this.error.asReadonly();

  constructor(private readonly service: CourseService) {}

  load(): void {
    this.service.getAll().subscribe({
      next: (courses) => {
        if (courses.length > 0) {
          this.courses.set(courses);
        }
        this.error.set(null);
      },
      error: () => this.error.set("Unable to load courses."),
    });
  }

  addCourse(course: Partial<Course>): void {
    const id = this.courses().length ? Math.max(...this.courses().map((item) => item.id)) + 1 : 1001;
    const nextCourse: Course = {
      id,
      code: course.code ?? `SUB-${id}`,
      title: course.title ?? "New Subject",
      maxCapacity: course.maxCapacity ?? 30,
      enrollmentCount: course.enrollmentCount ?? 0,
      status: course.status ?? "Open",
    };

    this.courses.update((current) => [...current, nextCourse]);
    this.error.set(null);
  }

  updateCourse(id: number, updates: Partial<Course>): void {
    this.courses.update((current) =>
      current.map((course) =>
        course.id === id
          ? {
              ...course,
              ...updates,
              maxCapacity: updates.maxCapacity ?? course.maxCapacity,
              enrollmentCount: updates.enrollmentCount ?? course.enrollmentCount,
            }
          : course,
      ),
    );
  }

  deleteCourse(id: number): void {
    const previousSnapshot = this.courses();
    this.courses.set(this.courses().filter((course) => course.id !== id));

    this.service
      .delete(id)
      .pipe(
        catchError(() => {
          this.courses.set(previousSnapshot);
          this.error.set("Cannot delete course: active student enrollments exist.");
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
