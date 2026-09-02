import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { roleGuard } from "./guards/role.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/login/login.component").then(
        (module) => module.LoginComponent,
      ),
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("./features/unauthorized/unauthorized.component").then(
        (module) => module.UnauthorizedComponent,
      ),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/instructor-dashboard/instructor-dashboard.component").then(
        (module) => module.InstructorDashboardComponent,
      ),
  },
  {
    path: "register",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/enrollment-form/enrollment-form.component").then(
        (module) => module.EnrollmentFormComponent,
      ),
  },
  {
    path: "student-dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (module) => module.StudentDashboardComponent,
      ),
  },
  {
    path: "subjects",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (module) => module.StudentDashboardComponent,
      ),
  },
  {
    path: "subject-list",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (module) => module.StudentDashboardComponent,
      ),
  },
  {
    path: "enroll",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/enrollment-form/enrollment-form.component").then(
        (module) => module.EnrollmentFormComponent,
      ),
  },
  {
    path: "enrollments",
    canActivate: [authGuard, roleGuard("Instructor")],
    loadComponent: () =>
      import("./features/enrollment-list/enrollment-list.component").then(
        (module) => module.EnrollmentListComponent,
      ),
  },
  {
    path: "grade-submission",
    canActivate: [authGuard, roleGuard("Instructor")],
    loadComponent: () =>
      import("./features/grade-submission/grade-submission.component").then(
        (module) => module.GradeSubmissionComponent,
      ),
  },
  {
    path: "courses/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/course-detail/course-detail.component").then(
        (module) => module.CourseDetailComponent,
      ),
  },
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login" },
];
