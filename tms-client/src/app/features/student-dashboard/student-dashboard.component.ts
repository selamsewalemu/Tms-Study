import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";
import { Course } from "../../models/course.model";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { CourseService } from "../../services/course.service";
import { AuthService } from "../../services/auth.service";
import { EnrollmentStore } from "../../store/enrollment.store";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  private api = inject(CourseService);
  private authService = inject(AuthService);
  private enrollmentStore = inject(EnrollmentStore);
  private router = inject(Router);

  readonly pageSize = 5;
  readonly currentPage = signal(1);

  studentName = computed(() => this.authService.currentUser()?.displayName ?? "Student User");
  earnedCredits = signal(45);
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120
      ? "Eligible for Graduation"
      : "In Progress",
  );

  selectedCourse = signal<Course | null>(null);
  selectedCourseIds = signal<number[]>([]);

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  allCourses = computed(() => this.coursesResource.value() ?? []);
  totalPages = computed(() => Math.max(1, Math.ceil(this.allCourses().length / this.pageSize)));
  pagedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allCourses().slice(start, start + this.pageSize);
  });

  requestedSubjects = computed(() =>
    this.enrollmentStore
      .entities()
      .filter(
        (entry) =>
          entry.studentName === this.studentName() && entry.status === "Pending",
      ),
  );

  registerForClass(): void {
    this.earnedCredits.update((credits) => credits + 3);
  }

  changePage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(nextPage);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }

  handleEnroll(course: Course): void {
    this.selectedCourse.set(course);
    this.selectedCourseIds.update((current) =>
      current.includes(course.id) ? current : [...current, course.id],
    );

    this.enrollmentStore.requestEnrollment({
      id: Date.now(),
      studentName: this.studentName(),
      courseName: course.title,
      status: "Pending",
    });
  }

  submitSelectedRequests(): void {
    const courses = this.coursesResource.value() ?? [];
    const pendingCourses = courses.filter((course) => this.selectedCourseIds().includes(course.id));

    for (const course of pendingCourses) {
      this.handleEnroll(course);
    }
  }
}
