import { Component, inject } from "@angular/core";
import { AnalyticsChartComponent } from "../../ui/analytics-chart/analytics-chart.component";
import { CourseStore } from "../../store/course.store";
import { EnrollmentStore } from "../../store/enrollment.store";

@Component({
  selector: "tms-instructor-dashboard",
  standalone: true,
  imports: [AnalyticsChartComponent],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrl: "./instructor-dashboard.component.scss",
})
export class InstructorDashboardComponent {
  readonly courseStore = inject(CourseStore);
  readonly store = inject(EnrollmentStore);

  constructor() {
    this.courseStore.load();
    this.store.loadEnrollments();
  }
}
