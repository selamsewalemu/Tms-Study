using System.ComponentModel.DataAnnotations;

namespace TmsCore.Application.Dtos;

// Module 6 Exercise 2 Question 2: Validate the course creation contract at the HTTP boundary.
public sealed record CreateCourseRequest
{
	[Required]
	[RegularExpression("^[A-Z]{3}-\\d{3}$", ErrorMessage = "Code must follow the pattern XXX-000 (e.g., CSE-101).")]
	public required string Code { get; init; }

	[Required, MaxLength(200)]
	public required string Title { get; init; }

	[Range(1, 200)]
	public int MaxCapacity { get; init; }
}
