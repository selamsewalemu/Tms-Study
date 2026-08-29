import { computed, inject, Injectable, signal } from "@angular/core";
import { Enrollment } from "../models/enrollment.model";
import { EnrollmentService } from "../services/enrollment.service";

interface EnrollmentState {
  entities: Enrollment[];
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class EnrollmentStore {
  private readonly service = inject(EnrollmentService);
  private readonly state = signal<EnrollmentState>({
    entities: [],
    isLoading: false,
    error: null,
  });

  readonly entities = computed(() => this.state().entities);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly pendingCount = computed(
    () => this.entities().filter((entry) => entry.status === "Pending").length,
  );

  loadEnrollments(): void {
    this.state.update((current) => ({ ...current, isLoading: true, error: null }));

    this.service.getAll().subscribe({
      next: (enrollments) => {
        this.state.update((current) => ({ ...current, entities: enrollments, isLoading: false }));
      },
      error: () => {
        this.state.update((current) => ({
          ...current,
          isLoading: false,
          error: "Unable to load enrollments.",
        }));
      },
    });
  }

  approveEnrollment(id: number): void {
    this.state.update((current) => ({
      ...current,
      entities: current.entities.map((entry) =>
        entry.id === id ? { ...entry, status: "Approved" } : entry,
      ),
    }));
  }
}
