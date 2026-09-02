import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  errorMessage = "";
  isSubmitting = false;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = "Username and password are required.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    try {
      await this.authService.login(this.form.getRawValue());

      const role = this.authService.currentUser()?.role ?? "Student";
      const targetRoute = role === "Admin" || role === "Instructor" ? "/dashboard" : "/student-dashboard";
      await this.router.navigateByUrl(targetRoute);
    } catch {
      this.errorMessage = "Invalid username or password. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }
}
