import { Injectable, signal, computed, inject } from "@angular/core";
import {
  StudentRegistration,
  RegistrationDraft,
  RegistrationStatus,
} from "../models/student-registration.model";
import { AuthService } from "./auth.service";
import { EmailService } from "./email.service";

const STORAGE_KEY = "tms.registrations";

@Injectable({ providedIn: "root" })
export class RegistrationService {
  private readonly auth  = inject(AuthService);
  private readonly email = inject(EmailService);
  private readonly _registrations = signal<StudentRegistration[]>(this.load());

  /* ── Public read-only views ─────────────────────────────────── */
  readonly all          = this._registrations.asReadonly();
  readonly pending      = computed(() => this._registrations().filter((r) => r.status === "Pending"));
  readonly approved     = computed(() => this._registrations().filter((r) => r.status === "Approved"));
  readonly rejected     = computed(() => this._registrations().filter((r) => r.status === "Rejected"));
  readonly pendingCount = computed(() => this.pending().length);

  /* ── Submit (student side) ──────────────────────────────────── */
  submit(draft: RegistrationDraft): StudentRegistration {
    const record: StudentRegistration = {
      ...draft,
      id: `REG-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "Pending",
      adminNote: "",
      username: "",
      generatedPassword: "",
    };
    this._registrations.update((list) => [record, ...list]);
    this.persist();
    return record;
  }

  /* ── Admin: approve — creates login credentials + sends email ── */
  approve(id: string, note = ""): string {
    const reg = this._registrations().find((r) => r.id === id);
    if (!reg) return "";

    const username = this.generateUsername(reg);
    const password = this.generatePassword(reg);

    this.auth.createAccount(reg.firstName + " " + reg.lastName, username, password, "Student");

    this._registrations.update((list) =>
      list.map((r) =>
        r.id === id
          ? { ...r, status: "Approved" as RegistrationStatus, adminNote: note || r.adminNote, username, generatedPassword: password }
          : r,
      ),
    );
    this.persist();

    /* Auto-send congratulations email via Gmail */
    const updated = this._registrations().find((r) => r.id === id)!;
    const payload = this.email.buildApprovalEmail(updated);
    this.email.sendViaGmail(payload);

    return id;
  }

  /* ── Admin: reject — sends formal regret email ───────────────── */
  reject(id: string, note = ""): void {
    const reg = this._registrations().find((r) => r.id === id);
    this.updateStatus(id, "Rejected", note);

    if (reg) {
      const updated = this._registrations().find((r) => r.id === id)!;
      const payload = this.email.buildRejectionEmail(updated);
      this.email.sendViaGmail(payload);
    }
  }

  /* ── Admin: update note ─────────────────────────────────────── */
  updateNote(id: string, note: string): void {
    this._registrations.update((list) =>
      list.map((r) => (r.id === id ? { ...r, adminNote: note } : r)),
    );
    this.persist();
  }

  /* ── Admin: delete ──────────────────────────────────────────── */
  delete(id: string): void {
    this._registrations.update((list) => list.filter((r) => r.id !== id));
    this.persist();
  }

  /* ── Lookup by reference ID (student status check) ──────────── */
  getById(id: string): StudentRegistration | undefined {
    return this._registrations().find((r) => r.id === id);
  }

  /* ── Private helpers ────────────────────────────────────────── */
  private updateStatus(id: string, status: RegistrationStatus, note: string): void {
    this._registrations.update((list) =>
      list.map((r) =>
        r.id === id ? { ...r, status, adminNote: note || r.adminNote } : r,
      ),
    );
    this.persist();
  }

  /**
   * Username: firstName.lastName (lowercased, no spaces, ASCII-safe)
   * Deduplicates by appending a numeric suffix if the username already exists.
   */
  private generateUsername(reg: StudentRegistration): string {
    const base = `${reg.firstName}.${reg.lastName}`
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9.]/g, "");

    const existing = this.auth.accounts().map((a) => a.username.toLowerCase());
    if (!existing.includes(base)) return base;

    let i = 2;
    while (existing.includes(`${base}${i}`)) i++;
    return `${base}${i}`;
  }

  /**
   * Password: first 3 letters of last name (capitalised) + grad year + "@Tms"
   * e.g. Bek2023@Tms — always meets the ≥6-char minimum, memorable to the student.
   */
  private generatePassword(reg: StudentRegistration): string {
    const namePart = reg.lastName.slice(0, 3).replace(/[^a-zA-Z]/g, "").padEnd(3, "x");
    const capitalize = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    return `${capitalize}${reg.graduationYear}@Tms`;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._registrations()));
    } catch {
      /* Quota exceeded — session data intact */
    }
  }

  private load(): StudentRegistration[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.seedDemoData();
      const parsed = JSON.parse(raw) as StudentRegistration[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return this.seedDemoData();
    } catch {
      return this.seedDemoData();
    }
  }

  private seedDemoData(): StudentRegistration[] {
    const demo: StudentRegistration[] = [
      {
        id: "REG-1001",
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        firstName: "Amina", middleName: "Tigist", lastName: "Bekele",
        gender: "Female", dateOfBirth: "2002-04-15", nationality: "Ethiopian",
        email: "amina.bekele@email.com", phone: "+251911234567",
        address: "Addis Ababa, Ethiopia",
        desiredProgram: "Computer Science", educationLevel: "High School",
        institution: "Addis Ababa Preparatory School", graduationYear: "2023",
        gpa: "", examScore: "485.50",
        photoDataUrl: "", documentDataUrl: "", documentName: "transcript.pdf",
        status: "Pending", adminNote: "",
        username: "", generatedPassword: "",
      },
      {
        id: "REG-1002",
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        firstName: "Dawit", middleName: "", lastName: "Tadesse",
        gender: "Male", dateOfBirth: "2001-09-20", nationality: "Ethiopian",
        email: "dawit.tadesse@email.com", phone: "+251922345678",
        address: "Dire Dawa, Ethiopia",
        desiredProgram: "Business Administration", educationLevel: "High School",
        institution: "Dire Dawa Preparatory School", graduationYear: "2022",
        gpa: "", examScore: "412.00",
        photoDataUrl: "", documentDataUrl: "", documentName: "id_document.pdf",
        status: "Approved", adminNote: "All documents verified. Welcome aboard!",
        username: "dawit.tadesse", generatedPassword: "Tad2022@Tms",
      },
      {
        id: "REG-1003",
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        firstName: "Liya", middleName: "Hailé", lastName: "Solomon",
        gender: "Female", dateOfBirth: "2003-01-08", nationality: "Ethiopian",
        email: "liya.solomon@email.com", phone: "+251933456789",
        address: "Hawassa, Ethiopia",
        desiredProgram: "Data Science", educationLevel: "High School",
        institution: "Hawassa University Preparatory", graduationYear: "2023",
        gpa: "", examScore: "520.75",
        photoDataUrl: "", documentDataUrl: "", documentName: "transcript.pdf",
        status: "Rejected", adminNote: "Application incomplete. Please reapply with valid transcripts.",
        username: "", generatedPassword: "",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    return demo;
  }
}
