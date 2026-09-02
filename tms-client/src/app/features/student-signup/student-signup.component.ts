import { Component, inject, signal, computed, effect } from "@angular/core";
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { RegistrationService } from "../../services/registration.service";
import { RegistrationDraft } from "../../models/student-registration.model";

/** Simple email validator */
function emailValidator(ctrl: AbstractControl) {
  const v: string = ctrl.value ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : { invalidEmail: true };
}

@Component({
  selector: "app-student-signup",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./student-signup.component.html",
  styleUrl:    "./student-signup.component.scss",
})
export class StudentSignupComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly svc    = inject(RegistrationService);
  private readonly router = inject(Router);

  /* ── Step state ─────────────────────────────────────────────── */
  readonly currentStep  = signal(1);
  readonly TOTAL_STEPS  = 4;
  readonly isSubmitting = signal(false);
  readonly submitted    = signal(false);
  readonly submittedId  = signal("");

  /* ── File previews ──────────────────────────────────────────── */
  readonly photoPreview    = signal<string>("");
  readonly documentName    = signal<string>("");
  readonly documentDataUrl = signal<string>("");
  readonly photoError      = signal<string>("");
  readonly docError        = signal<string>("");

  /* ── Form ───────────────────────────────────────────────────── */
  readonly form = this.fb.nonNullable.group({
    /* Step 1 — Personal */
    firstName:  ["", [Validators.required, Validators.minLength(2)]],
    middleName: [""],
    lastName:   ["", [Validators.required, Validators.minLength(2)]],
    gender:     ["" as "Male" | "Female" | "Other" | "", Validators.required],
    dateOfBirth:["", Validators.required],
    nationality:["", Validators.required],

    /* Step 2 — Contact */
    email:   ["", [Validators.required, emailValidator]],
    phone:   ["", [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
    address: ["", Validators.required],

    /* Step 3 — Academic */
    desiredProgram: ["", Validators.required],
    educationLevel: ["" as "High School" | "Bachelor" | "Master" | "Other" | "", Validators.required],
    institution:    ["", Validators.required],
    graduationYear: ["", [Validators.required, Validators.pattern(/^\d{4}$/)]],
    /* GPA used for Bachelor/Master/Other; cleared when High School */
    gpa:       [""],
    /* Grade 12 leave exam score: used only when educationLevel === High School */
    examScore: [""],
  });

  /** Reactive computed: is the selected education level High School? */
  readonly isHighSchool = computed(
    () => this.form.controls.educationLevel.value === "High School"
  );

  constructor() {
    // When education level changes, swap validators between gpa and examScore
    effect(() => {
      const hs = this.isHighSchool();
      const gpaCtrl   = this.form.controls.gpa;
      const examCtrl  = this.form.controls.examScore;

      if (hs) {
        gpaCtrl.clearValidators();
        gpaCtrl.setValue("");
        examCtrl.setValidators([
          Validators.required,
          Validators.pattern(/^([0-9]{1,3})(\.[0-9]{1,2})?$/),
          Validators.max(700),
          Validators.min(0),
        ]);
      } else {
        examCtrl.clearValidators();
        examCtrl.setValue("");
        gpaCtrl.setValidators([
          Validators.required,
          Validators.pattern(/^([0-4](\.\d{1,2})?|4\.0+)$/),
        ]);
      }

      gpaCtrl.updateValueAndValidity({ emitEvent: false });
      examCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /* ── Step groups ─────────────────────────────────────────────── */
  private readonly STEP_FIELDS: Record<number, (keyof typeof this.form.controls)[]> = {
    1: ["firstName", "middleName", "lastName", "gender", "dateOfBirth", "nationality"],
    2: ["email", "phone", "address"],
    3: ["desiredProgram", "educationLevel", "institution", "graduationYear", "gpa", "examScore"],
    4: [],
  };

  readonly progressPct = computed(() => ((this.currentStep() - 1) / (this.TOTAL_STEPS - 1)) * 100);

  /* ── Navigation ─────────────────────────────────────────────── */
  next(): void {
    const step   = this.currentStep();
    const fields = this.STEP_FIELDS[step] ?? [];
    fields.forEach((name) => this.form.controls[name].markAsTouched());
    if (fields.some((name) => this.form.controls[name].invalid)) return;
    if (step === 4) { this.submitAll(); return; }
    this.currentStep.set(step + 1);
  }

  prev(): void {
    if (this.currentStep() > 1) this.currentStep.set(this.currentStep() - 1);
  }

  goStep(n: number): void {
    if (n < this.currentStep()) this.currentStep.set(n);
  }

  /* ── File handlers ──────────────────────────────────────────── */
  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.photoError.set("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.photoError.set("Only image files are accepted (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      this.photoError.set("Photo must be smaller than 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onDocumentChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.docError.set("");
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      this.docError.set("Accepted formats: PDF, JPG, PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.docError.set("Document must be smaller than 5 MB.");
      return;
    }
    this.documentName.set(file.name);
    const reader = new FileReader();
    reader.onload = (e) => this.documentDataUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  clearPhoto(): void    { this.photoPreview.set(""); this.photoError.set(""); }
  clearDocument(): void { this.documentName.set(""); this.documentDataUrl.set(""); this.docError.set(""); }

  /* ── Final submit ───────────────────────────────────────────── */
  private async submitAll(): Promise<void> {
    if (!this.photoPreview()) { this.photoError.set("A profile photo is required."); return; }
    if (!this.documentName()) { this.docError.set("An academic document is required."); return; }

    this.isSubmitting.set(true);
    await new Promise<void>((r) => setTimeout(r, 800));

    const v = this.form.getRawValue();
    const draft: RegistrationDraft = {
      firstName: v.firstName, middleName: v.middleName, lastName: v.lastName,
      gender: v.gender, dateOfBirth: v.dateOfBirth, nationality: v.nationality,
      email: v.email, phone: v.phone, address: v.address,
      desiredProgram: v.desiredProgram, educationLevel: v.educationLevel,
      institution: v.institution, graduationYear: v.graduationYear,
      gpa:       v.gpa,
      examScore: v.examScore,
      photoDataUrl: this.photoPreview(),
      documentDataUrl: this.documentDataUrl(),
      documentName: this.documentName(),
    };

    const record = this.svc.submit(draft);
    this.submittedId.set(record.id);
    this.isSubmitting.set(false);
    this.submitted.set(true);
  }

  /* ── Helpers ────────────────────────────────────────────────── */
  isStepValid(step: number): boolean {
    return (this.STEP_FIELDS[step] ?? []).every((n) => this.form.controls[n].valid);
  }

  fieldInvalid(name: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.controls[name];
    return ctrl.invalid && ctrl.touched;
  }

  readonly PROGRAMS = [
    "Software Engineering",
    "Computer Engineering",
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Business Administration",
    "Accounting & Finance",
    "Economics",
    "Electrical Engineering",
    "Civil Engineering",
    "Mechanical Engineering",
    "Nursing",
    "Public Health",
    "Law",
    "Education",
    "Architecture",
    "Other",
  ];

  readonly YEARS = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i));
}
