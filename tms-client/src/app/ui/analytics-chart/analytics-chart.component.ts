import { Component, computed, input } from "@angular/core";
import { Enrollment } from "../../models/enrollment.model";

@Component({
  selector: "tms-analytics-chart",
  standalone: true,
  templateUrl: "./analytics-chart.component.html",
  styleUrl: "./analytics-chart.component.scss",
})
export class AnalyticsChartComponent {
  readonly data = input.required<Enrollment[]>();

  readonly approvedHeight = computed(() => {
    const count = this.data().filter((entry) => entry.status === "Approved").length;
    return Math.max(20, count * 3);
  });

  readonly pendingHeight = computed(() => {
    const count = this.data().filter((entry) => entry.status === "Pending").length;
    return Math.max(20, count * 3);
  });

  readonly rejectedHeight = computed(() => {
    const count = this.data().filter((entry) => entry.status === "Rejected").length;
    return Math.max(20, count * 3);
  });
}
