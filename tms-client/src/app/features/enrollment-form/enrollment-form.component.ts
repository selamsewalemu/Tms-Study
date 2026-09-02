import { Component, inject, signal, computed } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-enrollment-form",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./enrollment-form.component.html",
  styleUrl: "./enrollment-form.component.scss",
})
export class EnrollmentFormComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitted   = signal(false);
  readonly isSubmitting = signal(false);

  readonly studentName = computed(
    () => this.auth.currentUser()?.displayName ?? "Student",
  );

  readonly TERMS = [
    "Fall 2026",
    "Spring 2027",
    "Summer 2027",
    "Fall 2027",
  ];

  readonly form = this.fb.nonNullable.group({
    studentId: [
      "",
      [Validators.required, Validators.pattern("^STU-[0-9]{4}$")],
    ],
    courseId: ["", [Validators.required, Validators.minLength(3)]],
    term:     ["Fall 2026", Validators.required],
    notes:    [""],
    backupCourses: this.fb.array<FormControl<string>>([]),
  });

  get backups(): FormArray<FormControl<string>> {
    return this.form.controls.backupCourses;
  }

  /** Field-level helpers for cleaner template logic */
  isInvalid(name: "studentId" | "courseId" | "term"): boolean {
    const ctrl = this.form.controls[name];
    return ctrl.invalid && ctrl.touched;
  }

  addBackup(): void {
    this.backups.push(
      this.fb.control("", { nonNullable: true, validators: Validators.required }),
    );
  }

  removeBackup(index: number): void {
    this.backups.removeAt(index);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate async submission (replace with real HTTP call when ready)
    await new Promise<void>((resolve) => setTimeout(resolve, 900));

    const payload = this.form.getRawValue();
    console.log("Enrollment payload:", payload);

    this.isSubmitting.set(false);
    this.submitted.set(true);
  }

  resetForm(): void {
    this.form.reset({ term: "Fall 2026" });
    while (this.backups.length) this.backups.removeAt(0);
    this.submitted.set(false);
  }

  goBack(): void {
    this.router.navigateByUrl("/student-dashboard");
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }
}
