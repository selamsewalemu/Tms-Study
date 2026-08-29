import { Component, computed, inject, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { Course } from "../../models/course.model";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { CourseService } from "../../services/course.service";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  // inject(CourseService) requests the service we just created.
  // Angular finds the singleton instance and gives it to us.
  private api = inject(CourseService);

  studentName = signal("Liya Kebede");
  earnedCredits = signal(45);
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120
      ? "Eligible for Graduation"
      : "In Progress",
  );

  selectedCourse = signal<Course | null>(null);

  // rxResource wraps the HTTP call into three managed signals:
  // - coursesResource.isLoading() → true while waiting for the server response
  // - coursesResource.error() → the error object if the request fails
  // - coursesResource.value() → the Course[] array when the request succeeds
  //
  // It handles subscribing (starting the request) and unsubscribing (cleaning up
  // if the user navigates away before the response arrives) automatically.
  // You never write .subscribe() or .unsubscribe() with rxResource.
  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  registerForClass(): void {
    this.earnedCredits.update((credits) => credits + 3);
  }

  handleEnroll(course: Course): void {
    this.selectedCourse.set(course);
    console.log("Enrollment requested for:", course.title);
  }
}
