namespace TmsCore.Application.Models;

public class EnrollmentRecord
{
	public string Id { get; init; } = string.Empty;
	public string StudentId { get; init; } = string.Empty;
	public string CourseCode { get; init; } = string.Empty;
	public DateTime EnrollmentDate { get; init; }
}

