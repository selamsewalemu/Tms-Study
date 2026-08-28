namespace TmsCore.Application.Dtos;

// Module 6 Exercise 2 Question 1: Return a DTO without EF navigation properties.
public sealed record CourseResponseDto(int Id, string Code, string Title, int MaxCapacity, int EnrollmentCount);
