import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { Enrollment } from "../models/enrollment.model";

const sampleEnrollments: Enrollment[] = [
  { id: 1, studentName: "Amina Bekele", courseName: "Business Foundations", status: "Pending" },
  { id: 2, studentName: "Dawit Tadesse", courseName: "Advanced SQL", status: "Approved" },
  { id: 3, studentName: "Liya Kebede", courseName: "Leadership Essentials", status: "Pending" },
  { id: 4, studentName: "Selam Hailu", courseName: "Data Visualization", status: "Rejected" },
  { id: 5, studentName: "Bekalu Mamo", courseName: "Customer Success", status: "Approved" },
  { id: 6, studentName: "Marta Solomon", courseName: "Communication Skills", status: "Pending" },
  { id: 7, studentName: "Daniel Tesfaye", courseName: "UX Research", status: "Approved" },
  { id: 8, studentName: "Netsanet Bekele", courseName: "AI Governance", status: "Pending" },
  { id: 9, studentName: "Abel Lemma", courseName: "Operations Strategy", status: "Approved" },
  { id: 10, studentName: "Sara Alemu", courseName: "Financial Modeling", status: "Rejected" },
  { id: 11, studentName: "Hirut Teshome", courseName: "Project Leadership", status: "Approved" },
  { id: 12, studentName: "Yosef Haile", courseName: "Digital Marketing", status: "Pending" },
  { id: 13, studentName: "Rahel Berhanu", courseName: "Cloud Basics", status: "Approved" },
  { id: 14, studentName: "Kibrom Girmay", courseName: "Negotiation Lab", status: "Pending" },
  { id: 15, studentName: "Mekdes Asfaw", courseName: "Human Factors", status: "Approved" },
  { id: 16, studentName: "Biruk Solomon", courseName: "Systems Thinking", status: "Rejected" },
  { id: 17, studentName: "Tigist Hagos", courseName: "Cybersecurity Essentials", status: "Pending" },
  { id: 18, studentName: "Samuel Girma", courseName: "Data Ethics", status: "Approved" },
  { id: 19, studentName: "Feysel Ali", courseName: "Product Analytics", status: "Pending" },
  { id: 20, studentName: "Eden Mesfin", courseName: "Service Design", status: "Approved" },
];

@Injectable({ providedIn: "root" })
export class EnrollmentService {
  getAll(): Observable<Enrollment[]> {
    return of(sampleEnrollments).pipe(delay(150));
  }

  approve(id: number): Observable<Enrollment | undefined> {
    const enrolment = sampleEnrollments.find((entry) => entry.id === id);
    if (!enrolment) {
      return of(undefined).pipe(delay(50));
    }

    enrolment.status = "Approved";
    return of(enrolment).pipe(delay(50));
  }
}
