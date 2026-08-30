import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { firstValueFrom } from "rxjs";
import { EnrollmentService } from "./enrollment.service";
import { Enrollment } from "../models/enrollment.model";

describe("EnrollmentService", () => {
  let httpMock: HttpTestingController;
  let service: EnrollmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(EnrollmentService);
  });

  afterEach(() => httpMock.verify());

  it("should retrieve enrollments from local data", async () => {
    const result = await firstValueFrom(service.getAll());
    expect(result).toHaveLength(20);
    expect(result[0].studentName).toBe("Amina Bekele");
    expect(result[0].courseName).toBe("Business Foundations");
    expect(result[0].status).toBe("Pending");
  });

  it("should filter enrollments by pending status", async () => {
    const result = await firstValueFrom(service.getAll());
    const pendingEnrollments = result.filter((e) => e.status === "Pending");
    expect(pendingEnrollments.length).toBeGreaterThan(0);
    expect(pendingEnrollments[0].status).toBe("Pending");
  });

  it("should have unique enrollment ids", async () => {
    const result = await firstValueFrom(service.getAll());
    const ids = result.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("approve(id) should update enrollment status to Approved", async () => {
    const result = await firstValueFrom(service.approve(1));
    expect(result).toBeTruthy();
    expect(result?.status).toBe("Approved");
    expect(result?.id).toBe(1);
    expect(result?.studentName).toBe("Amina Bekele");
  });

  it("approve(id) should handle non-existent enrollment", async () => {
    const result = await firstValueFrom(service.approve(999));
    expect(result).toBeUndefined();
  });

  it("should maintain enrollment data integrity after approval", async () => {
    const allBefore = await firstValueFrom(service.getAll());
    const enrollmentBefore = allBefore.find((e) => e.id === 3);

    await firstValueFrom(service.approve(3));

    const allAfter = await firstValueFrom(service.getAll());
    const enrollmentAfter = allAfter.find((e) => e.id === 3);

    expect(enrollmentAfter?.courseName).toBe(enrollmentBefore?.courseName);
    expect(enrollmentAfter?.studentName).toBe(enrollmentBefore?.studentName);
    expect(enrollmentAfter?.status).toBe("Approved");
  });
});
