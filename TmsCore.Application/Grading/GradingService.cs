namespace TmsCore.Application.Grading;

public class GradingService
{
    public const decimal DistinctionThreshold = 70m;
    public const decimal PassThreshold = 50m;

    public GradeLevel CalculateLetterGrade(decimal score, decimal maxScore)
    {
        if (maxScore <= 0m || score < 0m || score > maxScore)
        {
            return GradeLevel.Invalid;
        }

        decimal percent = score / maxScore * 100m;

        if (percent >= DistinctionThreshold)
        {
            return GradeLevel.Distinction;
        }

        if (percent >= PassThreshold)
        {
            return GradeLevel.Pass;
        }

        return GradeLevel.Fail;
    }

    public GradeLevel CalculateFromEnrollmentGrade(decimal? enrollmentGradePercent)
    {
        if (enrollmentGradePercent is null)
        {
            return GradeLevel.Invalid;
        }

        return CalculateLetterGrade(enrollmentGradePercent.Value, 100m);
    }
}
