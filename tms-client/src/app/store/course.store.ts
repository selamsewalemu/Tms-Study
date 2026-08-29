import { Injectable, signal } from "@angular/core";
import { EMPTY, catchError, of } from "rxjs";
import { Course } from "../models/course.model";
import { CourseService } from "../services/course.service";

@Injectable({ providedIn: "root" })
export class CourseStore {
  private readonly courses = signal<Course[]>([]);
  private readonly error = signal<string | null>(null);

  readonly entities = this.courses.asReadonly();
  readonly currentError = this.error.asReadonly();

  constructor(private readonly service: CourseService) {}

  load(): void {
    this.service.getAll().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.error.set(null);
      },
      error: () => this.error.set("Unable to load courses."),
    });
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
