import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/instructor-dashboard/instructor-dashboard.component").then(
        (module) => module.InstructorDashboardComponent,
      ),
  },
  {
    path: "student-dashboard",
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (module) => module.StudentDashboardComponent,
      ),
  },
  {
    path: "enroll",
    loadComponent: () =>
      import("./features/enrollment-form/enrollment-form.component").then(
        (module) => module.EnrollmentFormComponent,
      ),
  },
  {
    path: "enrollments",
    loadComponent: () =>
      import("./features/enrollment-list/enrollment-list.component").then(
        (module) => module.EnrollmentListComponent,
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
