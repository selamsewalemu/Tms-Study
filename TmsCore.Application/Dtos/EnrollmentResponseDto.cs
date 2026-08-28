namespace TmsCore.Application.Dtos;

// Module 6 Exercise 3 Question 2: Return only the enrollment fields exposed by the API.
public sealed record EnrollmentResponseDto(int Id, int CourseId, int StudentId, DateTime EnrolledAt);
