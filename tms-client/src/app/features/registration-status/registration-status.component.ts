import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { RegistrationService } from "../../services/registration.service";
import { StudentRegistration } from "../../models/student-registration.model";

@Component({
  selector: "app-registration-status",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./registration-status.component.html",
  styleUrl: "./registration-status.component.scss",
})
export class RegistrationStatusComponent {
  private readonly svc   = inject(RegistrationService);
  private readonly route = inject(ActivatedRoute);

  readonly refInput   = signal("");
  readonly searched   = signal(false);
  readonly result     = signal<StudentRegistration | null>(null);
  readonly showPwd    = signal(false);
  readonly copied     = signal<"username" | "password" | null>(null);

  constructor() {
    /* Pre-fill from query param ?ref=REG-xxx (linked from signup success) */
    const ref = this.route.snapshot.queryParamMap.get("ref");
    if (ref) {
      this.refInput.set(ref);
      this.lookup();
    }
  }

  lookup(): void {
    const id = this.refInput().trim().toUpperCase();
    if (!id) return;
    const found = this.svc.getById(id);
    this.result.set(found ?? null);
    this.searched.set(true);
  }

  togglePwd(): void { this.showPwd.update((v) => !v); }

  async copy(field: "username" | "password", value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(field);
      setTimeout(() => this.copied.set(null), 2000);
    } catch { /* clipboard not available */ }
  }

  formatDate(iso: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  readonly statusConfig = computed(() => {
    const r = this.result();
    if (!r) return null;
    switch (r.status) {
      case "Approved": return {
        icon: "check",
        color: "#22c55e",
        bg: "rgba(34,197,94,.10)",
        border: "rgba(34,197,94,.28)",
        title: "Application Approved!",
        body: "Congratulations! Your registration has been approved. Use the credentials below to sign in to the TMS Portal.",
      };
      case "Rejected": return {
        icon: "x",
        color: "#f87171",
        bg: "rgba(248,113,113,.10)",
        border: "rgba(248,113,113,.28)",
        title: "Application Not Accepted",
        body: "Unfortunately your application was not approved at this time. Please read the admin note below and contact the admissions office for next steps.",
      };
      default: return {
        icon: "clock",
        color: "#fbbf24",
        bg: "rgba(251,191,36,.10)",
        border: "rgba(251,191,36,.28)",
        title: "Application Under Review",
        body: "Your application is currently being reviewed by the admissions team. This usually takes 2–3 business days. Check back here with your Reference ID for updates.",
      };
    }
  });
}
