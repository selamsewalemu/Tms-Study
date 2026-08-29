import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { GradeSubmissionPayload, GradeSubmissionResult } from "../models/grade.model";

@Injectable({ providedIn: "root" })
export class GradeService {
  submitGrade(payload: GradeSubmissionPayload): Observable<GradeSubmissionResult> {
    return of({
      ...payload,
      message: `Grade ${payload.grade} recorded for student ${payload.studentId}.`,
    }).pipe(delay(700));
  }
}
