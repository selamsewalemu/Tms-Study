// Exercise 4: Define quiz and lab variants with a discriminated union.
export interface Quiz {
  readonly id: string;
  kind: "quiz";
  title: string;
  correctAnswers: number;
  totalQuestions: number;
}

// Exercise 4: Define the lab assignment variant.
export interface LabAssignment {
  readonly id: string;
  kind: "lab";
  title: string;
  functionalityScore: number;
  codeQualityScore: number;
}

// Exercise 4: Combine all supported assessment variants.
export type AssessmentItem = Quiz | LabAssignment;

// Exercise 4: Calculate a grade after narrowing by the discriminant.
export function calculateGrade(item: AssessmentItem): number {
  switch (item.kind) {
    case "quiz":
      if (item.totalQuestions === 0) {
        return 0;
      }

      return Math.round((item.correctAnswers / item.totalQuestions) * 100);
    case "lab":
      return Math.round(
        item.functionalityScore * 0.7 + item.codeQualityScore * 0.3,
      );
    default: {
      const check: never = item;
      throw new Error(`Unhandled assessment kind: ${JSON.stringify(check)}`);
    }
  }
}
