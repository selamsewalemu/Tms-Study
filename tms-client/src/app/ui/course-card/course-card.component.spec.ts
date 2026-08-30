import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, it, expect, beforeEach } from "vitest";
import { CourseCardComponent } from "./course-card.component";
import { Course } from "../../models/course.model";

describe("CourseCardComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it("should display the course title", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    // Set signal-based required input
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Advanced Web Dev");
  });

  it("should display the course code in parentheses", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("(CSE-101)");
  });

  it("should display enrollment count and capacity", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Enrolled 12 of 30 seats");
  });

  it("should show 'Accepting enrollments' when seats available", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Accepting enrollments");
  });

  it("should show 'Full' when course is at capacity", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 30,
    } as Course);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Full");
  });

  it("should emit enrollClicked event when button is clicked", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    const component = fixture.componentInstance;
    const course = {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course;
    fixture.componentRef.setInput("course", course);
    await fixture.whenStable();

    let emittedCourse: Course | null = null;
    component.enrollClicked.subscribe((c: Course) => (emittedCourse = c));

    const button = fixture.nativeElement.querySelector(
      "button",
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(emittedCourse).toBeTruthy();
    expect(emittedCourse?.title).toBe("Advanced Web Dev");
  });

  it("should disable enroll button when course is full", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 30,
    } as Course);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should enable enroll button when seats available", async () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput("course", {
      id: 1,
      code: "CSE-101",
      title: "Advanced Web Dev",
      maxCapacity: 30,
      enrollmentCount: 12,
    } as Course);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
