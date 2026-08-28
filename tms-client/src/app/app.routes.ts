import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (module) => module.StudentDashboardComponent,
      ),
  },
  {
    path: "courses/:id",
    loadComponent: () =>
      import("./features/course-detail/course-detail.component").then(
        (module) => module.CourseDetailComponent,
      ),
  },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "dashboard" },
];
