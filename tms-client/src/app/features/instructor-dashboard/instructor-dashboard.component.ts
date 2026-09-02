import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AnalyticsChartComponent } from "../../ui/analytics-chart/analytics-chart.component";
import { CourseStore } from "../../store/course.store";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AuthService, UserRole } from "../../services/auth.service";
import { RegistrationService } from "../../services/registration.service";
import { StudentRegistration } from "../../models/student-registration.model";

export interface SubjectDraft {
  title: string;
  code: string;
  maxCapacity: number | null;
}

export interface UserDraft {
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
}

@Component({
  selector: "tms-instructor-dashboard",
  standalone: true,
  imports: [AnalyticsChartComponent, FormsModule],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrl: "./instructor-dashboard.component.scss",
})
export class InstructorDashboardComponent {
  readonly courseStore = inject(CourseStore);
  readonly store = inject(EnrollmentStore);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  /* ── Pagination ───────────────────────────────────────────────── */
  readonly pageSize = 5;
  readonly coursePage = signal(1);
  readonly enrollmentPage = signal(1);

  /* ── Enrollment filters ───────────────────────────────────────── */
  readonly searchTerm = signal("");
  readonly statusFilter = signal<"All" | "Pending" | "Approved" | "Rejected">("All");

  /* ── Active panel (sidebar navigation) ───────────────────────── */
  readonly activePanel = signal<"enrollments" | "subjects" | "users" | "registrations">("enrollments");

  /* ── Subject form state ───────────────────────────────────────── */
  readonly subjectDraft = signal<SubjectDraft>({ title: "", code: "", maxCapacity: null });
  readonly subjectEditId = signal<number | null>(null);
  readonly subjectError = signal("");
  readonly subjectSuccess = signal("");

  /* ── User form state ──────────────────────────────────────────── */
  readonly userDraft = signal<UserDraft>({ fullName: "", username: "", password: "", role: "Student" });
  readonly userError = signal("");
  readonly userSuccess = signal("");
  readonly showPassword = signal(false);

  /* ── Derived counts ───────────────────────────────────────────── */
  readonly approvedCount = computed(
    () => this.store.entities().filter((e) => e.status === "Approved").length,
  );
  readonly pendingCount = computed(
    () => this.store.entities().filter((e) => e.status === "Pending").length,
  );
  readonly rejectedCount = computed(
    () => this.store.entities().filter((e) => e.status === "Rejected").length,
  );

  /* ── Filtered + paged enrollments ────────────────────────────── */
  readonly filteredEnrollments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.store.entities().filter((entry) => {
      const matchesStatus =
        this.statusFilter() === "All" || entry.status === this.statusFilter();
      const matchesSearch =
        !term ||
        entry.studentName.toLowerCase().includes(term) ||
        entry.courseName.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  });

  readonly enrollmentTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredEnrollments().length / this.pageSize)),
  );

  readonly pagedEnrollments = computed(() => {
    const start = (this.enrollmentPage() - 1) * this.pageSize;
    return this.filteredEnrollments().slice(start, start + this.pageSize);
  });

  /* ── Paged courses ────────────────────────────────────────────── */
  readonly courseTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.courseStore.entities().length / this.pageSize)),
  );

  readonly pagedCourses = computed(() => {
    const start = (this.coursePage() - 1) * this.pageSize;
    return this.courseStore.entities().slice(start, start + this.pageSize);
  });

  /* ── Users list (display) ─────────────────────────────────────── */
  readonly users = computed(() => this.authService.accounts());

  /* ── Registration review ──────────────────────────────────────── */
  readonly registrationSvc = inject(RegistrationService);
  readonly regFilter = signal<"All" | "Pending" | "Approved" | "Rejected">("All");
  readonly regSearch  = signal("");
  readonly selectedReg = signal<StudentRegistration | null>(null);
  readonly regNote     = signal("");
  readonly regPage     = signal(1);
  readonly regPageSize = 8;

  readonly filteredRegs = computed(() => {
    const filter = this.regFilter();
    const term   = this.regSearch().trim().toLowerCase();
    return this.registrationSvc.all().filter((r) => {
      const matchStatus = filter === "All" || r.status === filter;
      const matchSearch = !term ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.desiredProgram.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  });

  readonly regTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRegs().length / this.regPageSize)),
  );

  readonly pagedRegs = computed(() => {
    const start = (this.regPage() - 1) * this.regPageSize;
    return this.filteredRegs().slice(start, start + this.regPageSize);
  });

  setRegFilter(f: "All" | "Pending" | "Approved" | "Rejected"): void {
    this.regFilter.set(f);
    this.regPage.set(1);
  }

  setRegSearch(v: string): void {
    this.regSearch.set(v);
    this.regPage.set(1);
  }

  changeRegPage(page: number): void {
    this.regPage.set(Math.min(Math.max(1, page), this.regTotalPages()));
  }

  openReg(reg: StudentRegistration): void {
    this.selectedReg.set(reg);
    this.regNote.set(reg.adminNote);
  }

  closeReg(): void {
    this.selectedReg.set(null);
    this.regNote.set("");
  }

  approveReg(id: string): void {
    this.registrationSvc.approve(id, this.regNote());
    this.selectedReg.set(this.registrationSvc.getById(id) ?? null);
  }

  rejectReg(id: string): void {
    this.registrationSvc.reject(id, this.regNote());
    this.selectedReg.set(this.registrationSvc.getById(id) ?? null);
  }

  saveRegNote(id: string): void {
    this.registrationSvc.updateNote(id, this.regNote());
  }

  deleteReg(id: string): void {
    this.registrationSvc.delete(id);
    this.closeReg();
  }

  printReg(reg: StudentRegistration): void {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const statusColor: Record<string, string> = {
      Approved: "#16a34a",
      Rejected: "#dc2626",
      Pending:  "#d97706",
    };
    const color = statusColor[reg.status] ?? "#6366f1";
    const scoreLabel = reg.educationLevel === "High School"
      ? "Grade 12 Exam Score" : "GPA";
    const scoreValue = reg.educationLevel === "High School"
      ? (reg.examScore || "—") : (reg.gpa || "—");
    const photoHtml = reg.photoDataUrl
      ? `<img src="${reg.photoDataUrl}" class="photo" alt="Photo"/>`
      : `<div class="photo-placeholder">${reg.firstName[0]?.toUpperCase() ?? "?"}</div>`;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Registration — ${reg.firstName} ${reg.lastName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Segoe UI",sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:0}
    .page{max-width:780px;margin:0 auto;padding:32px 36px}
    /* ── Header ── */
    .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:24px}
    .header-left{display:flex;align-items:center;gap:18px}
    .photo{width:90px;height:90px;border-radius:10px;object-fit:cover;border:3px solid #e2e8f0}
    .photo-placeholder{width:90px;height:90px;border-radius:10px;background:#ede9fe;color:#6366f1;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;border:3px solid #e2e8f0}
    .name-block h1{font-size:1.4rem;font-weight:800;color:#0f172a;margin-bottom:4px}
    .name-block p{font-size:0.8rem;color:#64748b}
    .header-right{text-align:right}
    .ref-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 16px}
    .ref-box .ref-label{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:#94a3b8;margin-bottom:3px}
    .ref-box .ref-id{font-family:monospace;font-size:0.9rem;font-weight:700;color:#6366f1}
    .ref-box .ref-date{font-size:0.72rem;color:#94a3b8;margin-top:2px}
    .status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;background:${color};margin-top:8px}
    /* ── Sections ── */
    .section{margin-bottom:22px}
    .section-title{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;padding-bottom:7px;border-bottom:1px solid #f1f5f9;margin-bottom:12px;display:flex;align-items:center;gap:6px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}
    .grid.grid-3{grid-template-columns:1fr 1fr 1fr}
    .item{display:flex;flex-direction:column;gap:2px}
    .item.full{grid-column:1/-1}
    .item .lbl{font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8}
    .item .val{font-size:0.875rem;font-weight:500;color:#1e293b}
    .item .val.accent{color:#6366f1;font-weight:700}
    .item .val.score{font-size:1rem;font-weight:800;color:${color}}
    /* ── Doc row ── */
    .doc-row{display:flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;font-size:0.82rem;color:#475569}
    .doc-row .doc-name{font-weight:600;color:#334155}
    /* ── Note ── */
    .note-box{padding:12px 14px;border-left:3px solid ${color};background:#f8fafc;border-radius:0 8px 8px 0;font-size:0.82rem;color:#475569;font-style:italic}
    /* ── Footer ── */
    .footer{margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:0.72rem;color:#94a3b8}
    .footer .tms{font-weight:700;color:#6366f1}
    .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:72px;font-weight:900;color:rgba(99,102,241,0.05);pointer-events:none;white-space:nowrap;letter-spacing:0.1em}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}}
  </style>
</head>
<body>
<div class="watermark">TMS CORE</div>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      ${photoHtml}
      <div class="name-block">
        <h1>${reg.firstName} ${reg.middleName ? reg.middleName + " " : ""}${reg.lastName}</h1>
        <p>${reg.email} &nbsp;·&nbsp; ${reg.phone}</p>
        <span class="status-badge">${reg.status}</span>
      </div>
    </div>
    <div class="header-right">
      <div class="ref-box">
        <div class="ref-label">Reference ID</div>
        <div class="ref-id">${reg.id}</div>
        <div class="ref-date">Submitted: ${this.formatDate(reg.submittedAt)}</div>
      </div>
    </div>
  </div>

  <!-- Personal -->
  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="grid">
      <div class="item"><span class="lbl">Gender</span><span class="val">${reg.gender || "—"}</span></div>
      <div class="item"><span class="lbl">Date of Birth</span><span class="val">${reg.dateOfBirth || "—"}</span></div>
      <div class="item"><span class="lbl">Nationality</span><span class="val">${reg.nationality}</span></div>
      <div class="item"><span class="lbl">Phone</span><span class="val">${reg.phone}</span></div>
      <div class="item full"><span class="lbl">Address</span><span class="val">${reg.address}</span></div>
    </div>
  </div>

  <!-- Academic -->
  <div class="section">
    <div class="section-title">Academic Information</div>
    <div class="grid">
      <div class="item full"><span class="lbl">Desired Program</span><span class="val accent">${reg.desiredProgram}</span></div>
      <div class="item"><span class="lbl">Education Level</span><span class="val">${reg.educationLevel}</span></div>
      <div class="item"><span class="lbl">Institution</span><span class="val">${reg.institution}</span></div>
      <div class="item"><span class="lbl">Graduation Year</span><span class="val">${reg.graduationYear}</span></div>
      <div class="item"><span class="lbl">${scoreLabel}</span><span class="val score">${scoreValue}</span></div>
    </div>
  </div>

  <!-- Document -->
  ${reg.documentName ? `
  <div class="section">
    <div class="section-title">Submitted Document</div>
    <div class="doc-row">
      <span class="doc-name">${reg.documentName}</span>
    </div>
  </div>` : ""}

  <!-- Admin Note -->
  ${reg.adminNote ? `
  <div class="section">
    <div class="section-title">Admin Note</div>
    <div class="note-box">${reg.adminNote}</div>
  </div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <span class="tms">TMS Core</span>
    <span>Training Management System — Confidential</span>
    <span>Printed: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</span>
  </div>

</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  }

  regStatusClass(status: string): string {
    switch (status) {
      case "Approved": return "status-badge--approved";
      case "Rejected": return "status-badge--rejected";
      default:         return "status-badge--pending";
    }
  }

  formatDate(iso: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  constructor() {
    this.courseStore.load();
    this.store.loadEnrollments();
  }

  /* ── Navigation ───────────────────────────────────────────────── */
  setPanel(panel: "enrollments" | "subjects" | "users" | "registrations"): void {
    this.activePanel.set(panel);
  }

  /* ── Enrollment actions ───────────────────────────────────────── */
  setSearch(value: string): void {
    this.searchTerm.set(value);
    this.enrollmentPage.set(1);
  }

  setStatusFilter(value: "All" | "Pending" | "Approved" | "Rejected"): void {
    this.statusFilter.set(value);
    this.enrollmentPage.set(1);
  }

  changeEnrollmentPage(page: number): void {
    this.enrollmentPage.set(
      Math.min(Math.max(1, page), this.enrollmentTotalPages()),
    );
  }

  changeCoursePage(page: number): void {
    this.coursePage.set(
      Math.min(Math.max(1, page), this.courseTotalPages()),
    );
  }

  /* ── Subject CRUD ─────────────────────────────────────────────── */
  updateSubjectDraft(field: keyof SubjectDraft, value: string | number | null): void {
    this.subjectDraft.update((d) => ({ ...d, [field]: value }));
  }

  startEditSubject(id: number): void {
    const course = this.courseStore.entities().find((c) => c.id === id);
    if (!course) return;
    this.subjectDraft.set({
      title: course.title,
      code: course.code,
      maxCapacity: course.maxCapacity,
    });
    this.subjectEditId.set(id);
    this.subjectError.set("");
    this.subjectSuccess.set("");
    this.activePanel.set("subjects");
  }

  cancelEditSubject(): void {
    this.subjectDraft.set({ title: "", code: "", maxCapacity: null });
    this.subjectEditId.set(null);
    this.subjectError.set("");
    this.subjectSuccess.set("");
  }

  deleteSubject(id: number): void {
    this.courseStore.deleteCourse(id);
    if (this.subjectEditId() === id) {
      this.cancelEditSubject();
    }
  }

  submitSubject(): void {
    const draft = this.subjectDraft();
    const title = draft.title.trim();
    const code = draft.code.trim().toUpperCase();
    const capacity = Number(draft.maxCapacity);

    if (!title) {
      this.subjectError.set("Subject name is required.");
      return;
    }
    if (!code) {
      this.subjectError.set("Subject code is required.");
      return;
    }
    if (!capacity || capacity < 1) {
      this.subjectError.set("Capacity must be at least 1.");
      return;
    }

    const editId = this.subjectEditId();
    if (editId !== null) {
      this.courseStore.updateCourse(editId, { title, code, maxCapacity: capacity });
      this.subjectSuccess.set(`"${title}" updated successfully.`);
    } else {
      this.courseStore.addCourse({ title, code, maxCapacity: capacity, enrollmentCount: 0 });
      this.subjectSuccess.set(`"${title}" added to the catalogue.`);
    }

    this.subjectDraft.set({ title: "", code: "", maxCapacity: null });
    this.subjectEditId.set(null);
    this.subjectError.set("");
    setTimeout(() => this.subjectSuccess.set(""), 3500);
  }

  /* ── User CRUD ────────────────────────────────────────────────── */
  updateUserDraft(field: keyof UserDraft, value: string): void {
    this.userDraft.update((d) => ({ ...d, [field]: value }));
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  submitUser(): void {
    const draft = this.userDraft();
    const fullName = draft.fullName.trim();
    const username = draft.username.trim();
    const password = draft.password.trim();

    if (!fullName) {
      this.userError.set("Full name is required.");
      return;
    }
    if (!username) {
      this.userError.set("Username is required.");
      return;
    }
    if (!password || password.length < 6) {
      this.userError.set("Password must be at least 6 characters.");
      return;
    }

    const created = this.authService.createAccount(fullName, username, password, draft.role);
    if (!created) {
      this.userError.set(`Username "${username}" is already taken.`);
      return;
    }

    this.userSuccess.set(`Account for ${fullName} (${draft.role}) created.`);
    this.userDraft.set({ fullName: "", username: "", password: "", role: "Student" });
    this.userError.set("");
    setTimeout(() => this.userSuccess.set(""), 3500);
  }

  deleteUser(id: number): void {
    this.authService.removeAccount(id);
  }

  /* ── Auth ─────────────────────────────────────────────────────── */
  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }

  /* ── Helpers ──────────────────────────────────────────────────── */
  roleBadgeClass(role: string): string {
    switch (role) {
      case "Admin":      return "badge--admin";
      case "Instructor": return "badge--instructor";
      default:           return "badge--student";
    }
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
