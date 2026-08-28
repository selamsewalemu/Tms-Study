import { Temporal } from "@js-temporal/polyfill";
import {
  isStudent,
  parseStudent,
  type Student,
} from "./models/student.model.js";
import {
  calculateGrade,
  type AssessmentItem,
} from "./models/assessment.model.js";
import {
  describeCourse,
  type Course,
  type CourseStatus,
} from "./models/course.model.js";
import {
  describeEnrollment,
  type EnrollmentStatus,
} from "./models/enrollment.model.js";
import {
  renderResponse,
  type ApiResponse,
} from "./models/api-response.model.js";
import { PASS_THRESHOLD } from "./assessment-config.js";
import { canEnroll } from "./models/EnrollmentValidator.js";

// ==========================================================
// Module 1: TypeScript Foundations
// ==========================================================

// Exercise 1: Verify strict typing with readonly and optional properties.
const student: Student = {
  id: "STU-001",
  name: "Hana Tadesse",
  enrollmentDate: Temporal.Now.instant(),
};

// The following assignments intentionally stay commented because strict mode
// should reject them: readonly IDs cannot be changed, and optional GPA may be undefined.
// student.id = "STU-999";
// console.log(student.gpa.toFixed(2));

console.log(`Student: ${student.name}`);
console.log(`GPA: ${student.gpa?.toFixed(2) ?? "Not yet graded"}`);

// Exercise 2: Use a type guard to safely process unknown API data.
function processStudent(raw: unknown): void {
  if (isStudent(raw)) {
    const gpaDisplay = raw.gpa?.toFixed(2) ?? "Not yet graded";
    console.log(`Student ${raw.name} GPA: ${gpaDisplay}`);
  } else {
    console.error("Invalid student data received");
  }
}

processStudent({ id: "STU-001", name: "Hana", gpa: 3.7 });
processStudent(42);

// Exercise 3: Parse valid data and reject an invalid API response.
const parsedStudent = parseStudent({ id: "STU-002", name: "Abebe" });
console.log(`Parsed student: ${parsedStudent.name}`);

try {
  parseStudent({ id: 42, name: "Test" });
} catch (error: unknown) {
  if (error instanceof TypeError) {
    console.error(`Parse failed: ${error.message}`);
  }
}

// Module 1 checkpoint: model types, guards, and parsers are working.
console.log("Module 1 checks completed.");

// ==========================================================
// Module 2: Unions, Generics, and Temporal
// ==========================================================

// Exercise 1: Create quiz and lab values through the AssessmentItem union.
const quiz: AssessmentItem = {
  id: "QUIZ-001",
  kind: "quiz",
  title: "SQL Basics",
  correctAnswers: 8,
  totalQuestions: 10,
};

const lab: AssessmentItem = {
  id: "LAB-001",
  kind: "lab",
  title: "REST API Project",
  functionalityScore: 85,
  codeQualityScore: 90,
};

console.log(`Quiz grade: ${calculateGrade(quiz)}%`);
console.log(`Lab grade: ${calculateGrade(lab)}%`);

// Exercise 2: Describe an enrollment status using its discriminated union.
const pending: EnrollmentStatus = {
  status: "PENDING",
  requestedAt: Temporal.Now.instant(),
  studentId: "STU-001",
  courseId: "CRS-101",
};

console.log(describeEnrollment(pending));

// Exercise 3: Exercise every enrollment state supported by the state machine.
const enrollmentStates: EnrollmentStatus[] = [
  pending,
  {
    status: "APPROVED",
    approvedBy: "Registrar",
    approvedAt: Temporal.Now.instant(),
  },
  {
    status: "ACTIVE",
    startDate: Temporal.PlainDate.from("2026-09-01"),
    currentGrade: 87,
  },
  {
    status: "COMPLETED",
    finalGrade: 91,
    completedAt: Temporal.Now.instant(),
  },
  {
    status: "DROPPED",
    reason: "Schedule conflict",
    droppedAt: Temporal.Now.instant(),
  },
];

for (const enrollmentState of enrollmentStates) {
  console.log(describeEnrollment(enrollmentState));
}

// Exercise 4: Describe an active course lifecycle state.
const webDev: CourseStatus = {
  status: "ACTIVE",
  enrolledCount: 28,
  startDate: Temporal.PlainDate.from("2026-09-01"),
};

console.log(describeCourse(webDev));

// Exercise 5: Render a successful response containing one Student.
const studentResponse: ApiResponse<Student> = {
  status: "success",
  data: {
    id: "STU-001",
    name: "Dawit Bekele",
    enrollmentDate: Temporal.Now.instant(),
    gpa: 3.4,
  },
  fetchedAt: Temporal.Now.instant(),
};

console.log(
  renderResponse(
    studentResponse,
    (studentData) => `${studentData.name} GPA: ${studentData.gpa ?? "N/A"}`,
  ),
);

// Exercise 5 Part B: Reuse the same generic renderer with a Course array.
const courseListResponse: ApiResponse<Course[]> = {
  status: "success",
  data: [
    {
      id: "CRS-101",
      title: "Web Development Fundamentals",
      capacity: 30,
      startDate: Temporal.PlainDate.from("2026-09-01"),
    },
  ],
  fetchedAt: Temporal.Now.instant(),
};

console.log(
  renderResponse(
    courseListResponse,
    (courses) => courses.map((courseItem) => courseItem.title).join(", "),
  ),
);

// Exercise 5 Part C: Demonstrate the other two generic response states.
console.log(renderResponse({ status: "loading" }, () => "not used"));
console.log(
  renderResponse(
    { status: "error", message: "Service unavailable", statusCode: 503 },
    () => "not used",
  ),
);

// Exercise 6: Record one UTC instant and display it in two time zones.
const approvedAt = Temporal.Now.instant();
console.log(`Approved at (UTC): ${approvedAt}`);

const addisTime = approvedAt.toZonedDateTimeISO("Africa/Addis_Ababa");
const londonTime = approvedAt.toZonedDateTimeISO("Europe/London");
console.log(`Addis: ${addisTime.toPlainTime()}`);
console.log(`London: ${londonTime.toPlainTime()}`);

// Exercise 6 Part B: Use PlainDate for calendar dates without timezone ambiguity.
const courseStart = Temporal.PlainDate.from("2026-09-01");
const today = Temporal.Now.plainDateISO();
const daysUntilStart = today.until(courseStart).total({ unit: "days" });
console.log(`${Math.floor(daysUntilStart)} days until course starts`);

// Exercise 6 Part C: Calculate the remaining duration until an assignment deadline.
const deadline = Temporal.PlainDate.from("2026-12-15");
const remaining = today.until(deadline);
console.log(
  `${remaining.total({ unit: "days" })} days until assignment is due`,
);

// Module 2 checkpoint: unions, generics, and Temporal examples are working.
console.log("Module 2 checks completed.");

// ==========================================================
// Module 3: Git and Collaborative Tooling
// ==========================================================

// Module 3 Setup: initialize the tms-client repository and publish it to GitHub.
// Run these commands from the tms-client folder after creating an empty GitHub repository:
// git init
// git add .
// git commit -m "feat: add TMS TypeScript data layer from M2"
// git branch -M main
// git remote add origin https://github.com/YOUR-USERNAME/tms-client.git
// git push -u origin main

// Exercise 1: Use git switch for branches and git restore for files.
// git switch -c feature/course-capacity
// git restore models/course.model.ts
// git switch main

// Exercise 2: Use detached HEAD and reflog to recover an orphaned commit.
// git switch --detach HEAD~1
// git commit --allow-empty -m "feat: certificate generation logic"
// git switch main
// git reflog
// git branch rescue-certificate YOUR-COMMIT-HASH
// git switch rescue-certificate
// git switch main

// Exercise 3: Use the focused enrollment validator independently.
const validationCourse: Course = {
  id: "CRS-101",
  title: "C# Mastery",
  capacity: 2,
};

console.log(
  `Enrollment available: ${canEnroll(validationCourse, 1)}`,
);

// Exercise 3: keep one logical change in one atomic Conventional Commit.
// git switch main
// git switch -c feature/enrollment-capacity
// git add models/EnrollmentValidator.ts
// git commit -m "feat(enrollment): add max capacity validator"

// Exercise 4: Create and resolve a merge conflict between two branches.
// git switch main
// echo "export const PASS_THRESHOLD = 60;" > assessment-config.ts
// git add assessment-config.ts
// git commit -m "chore: setup baseline assessment rules"
// git switch -c feature/strict-assessments
// echo "export const PASS_THRESHOLD = 75;" > assessment-config.ts
// git commit -am "fix(assessment): increase threshold for honors certification"
// git switch main
// echo "export const PASS_THRESHOLD = 50;" > assessment-config.ts
// git commit -am "fix(assessment): lower threshold for inclusive grading"
// git merge feature/strict-assessments
// Resolve assessment-config.ts in the editor, remove all conflict markers,
// then stage and commit the chosen assessment threshold:
// git add assessment-config.ts
// git commit
// Verify the merge graph:
// git log --oneline --graph -5

// Exercise 4 implementation: use the centralized assessment threshold configuration.
console.log(`Assessment pass threshold: ${PASS_THRESHOLD}%`);

// Exercise 5: Squash local-only feature history before pushing it to GitHub.
// git commit --allow-empty -m "chore: started certificate logic"
// git commit --allow-empty -m "fix: forgot semicolon in PDF generator"
// git commit --allow-empty -m "oops: typo in student name"
// git commit --allow-empty -m "feat: finish PDF certificate logic"
// git switch -c cleanup/certificate-generator
// git reset --soft HEAD~4
// git commit -m "feat(certificate): implement PDF certificate generation"
// Verify the cleaned history:
// git log --oneline -5
// git switch main

// Module 3 checkpoint: setup, switch/restore, reflog, atomic commits,
// conflict resolution, and squash workflow are documented above.
console.log("Module 3 checks ready for Git workflow practice.");
