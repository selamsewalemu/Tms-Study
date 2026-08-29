import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-unauthorized",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="unauthorized">
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
    </section>
  `,
})
export class UnauthorizedComponent {}
