using System.ComponentModel.DataAnnotations;

namespace TmsCore.Application.Dtos;

// Module 6 Exercise 3 Question 1: Require a positive student identifier for enrollment.
public sealed record EnrollStudentRequest
{
	[Range(1, int.MaxValue, ErrorMessage = "StudentId must be a positive integer.")]
	public required int StudentId { get; init; }
}
