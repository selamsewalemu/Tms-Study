using Microsoft.EntityFrameworkCore;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Application.Dtos;
using TmsCore.Application.Interfaces;
using TmsCore.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace TmsCore.Infrastructure.Persistence.Services;

// Module 6 Exercise 3: Persist nested enrollments and return response DTOs.
public sealed class DatabaseEnrollmentService(TmsDbContext context, ILogger<DatabaseEnrollmentService> logger) : IDatabaseEnrollmentService
{
	public Task<EnrollmentResponseDto?> GetByIdAsync(int courseId, int id, CancellationToken ct) =>
		context.Enrollments.AsNoTracking()
			.Where(enrollment => enrollment.CourseId == courseId && enrollment.Id == id)
			.Select(enrollment => new EnrollmentResponseDto(enrollment.Id, enrollment.CourseId, enrollment.StudentId, enrollment.EnrolledAt))
			.FirstOrDefaultAsync(ct);

	// Exercise 5 Question 6: Project all enrollments for a course without leaking entities.
	public async Task<IReadOnlyList<EnrollmentResponseDto>> GetByCourseAsync(int courseId, CancellationToken ct)
	{
		return await context.Enrollments.AsNoTracking()
			.Where(enrollment => enrollment.CourseId == courseId)
			.OrderBy(enrollment => enrollment.Id)
			.Select(enrollment => new EnrollmentResponseDto(
				enrollment.Id,
				enrollment.CourseId,
				enrollment.StudentId,
				enrollment.EnrolledAt))
			.ToListAsync(ct);
	}

	public Task<bool> ExistsAsync(int studentId, string courseCode, CancellationToken ct) =>
		context.Enrollments.AnyAsync(
			enrollment => enrollment.StudentId == studentId && enrollment.Course.Code == courseCode,
			ct);

	public async Task AddAsync(Enrollment enrollment, CancellationToken ct)
	{
		context.Enrollments.Add(enrollment);
		await context.SaveChangesAsync(ct);
	}

	public async Task<IReadOnlyList<Enrollment>> GetByStudentIdAsync(int studentId, CancellationToken ct)
	{
		return await context.Enrollments
			.AsNoTracking()
			.Include(enrollment => enrollment.Course)
			.Where(enrollment => enrollment.StudentId == studentId)
			.OrderBy(enrollment => enrollment.Id)
			.ToListAsync(ct);
	}

	public async Task<EnrollmentResponseDto> CreateAsync(int courseId, EnrollStudentRequest request, CancellationToken ct)
	{
		Enrollment enrollment = new() { CourseId = courseId, StudentId = request.StudentId, EnrolledAt = DateTime.UtcNow };
		context.Enrollments.Add(enrollment);
		await context.SaveChangesAsync(ct);
		logger.LogInformation("Enrolled student {StudentId} in course {CourseId} as {EnrollmentId}", request.StudentId, courseId, enrollment.Id);
		return (await GetByIdAsync(courseId, enrollment.Id, ct))!;
	}
}

