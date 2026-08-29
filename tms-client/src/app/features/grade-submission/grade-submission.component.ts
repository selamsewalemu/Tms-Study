import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, exhaustMap, finalize, tap } from "rxjs";
import { GradeSubmissionPayload } from "../../models/grade.model";
import { GradeService } from "../../services/grade.service";
import { LiveSyncService } from "../../services/live-sync.service";

@Component({
  selector: "tms-grade-submission",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./grade-submission.component.html",
  styleUrl: "./grade-submission.component.scss",
})
export class GradeSubmissionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly gradeService = inject(GradeService);
  private readonly liveSync = inject(LiveSyncService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly statusMessage = signal<string | null>(null);
  readonly submitQueue = new Subject<GradeSubmissionPayload>();

  readonly form = this.fb.nonNullable.group({
    studentId: ["", [Validators.required, Validators.min(1)]],
    courseCode: ["", [Validators.required, Validators.minLength(3)]],
    grade: ["", [Validators.required, Validators.min(0), Validators.max(100)]],
    submittedBy: ["", Validators.required],
  });

  constructor() {
    this.submitQueue
      .pipe(
        exhaustMap((payload) => {
          this.isSubmitting.set(true);
          this.statusMessage.set(`Submitting ${payload.grade} for student ${payload.studentId}...`);

          return this.gradeService.submitGrade(payload).pipe(
            tap((result) => {
              this.statusMessage.set(result.message);
              this.liveSync.joinCourse(result.courseCode).catch((error) => {
                console.warn("Unable to join live update channel.", error);
              });
            }),
            finalize(() => this.isSubmitting.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.form.reset({
            studentId: "",
            courseCode: "",
            grade: "",
            submittedBy: "",
          });
        },
        error: () => {
          this.statusMessage.set("Grade submission failed. Please try again.");
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set("Please complete the form before submitting.");
      return;
    }

    const payload: GradeSubmissionPayload = {
      studentId: Number(this.form.value.studentId),
      courseCode: String(this.form.value.courseCode).trim(),
      grade: Number(this.form.value.grade),
      submittedBy: String(this.form.value.submittedBy).trim(),
    };

    this.submitQueue.next(payload);
  }
}
