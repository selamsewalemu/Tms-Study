import { Component, effect, inject, viewChild } from "@angular/core";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { EnrollmentStore } from "../../store/enrollment.store";

@Component({
  selector: "tms-enrollment-list",
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: "./enrollment-list.component.html",
  styleUrl: "./enrollment-list.component.scss",
})
export class EnrollmentListComponent {
  readonly store = inject(EnrollmentStore);
  readonly displayedColumns = ["studentName", "courseName", "status", "actions"];
  readonly dataSource = new MatTableDataSource();
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.entities();
    });

    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });

    this.store.loadEnrollments();
  }

  approveEnrollment(id: number): void {
    this.store.approveEnrollment(id);
  }
}
