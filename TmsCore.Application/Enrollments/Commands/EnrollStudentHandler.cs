using MediatR;
using TmsCore.Application.Common;
using TmsCore.Domain.Entities;
using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Enrollments.Commands;

public sealed class EnrollStudentHandler(
	IDatabaseEnrollmentService enrollmentService,
	ICourseService courseService)
	: IRequestHandler<EnrollStudentCommand, Result<EnrollmentCreated, EnrollmentError>>
{
	public async Task<Result<EnrollmentCreated, EnrollmentError>> Handle(
		EnrollStudentCommand command,
		CancellationToken ct)
	{
		Course? course = await courseService.GetByCodeAsync(command.CourseCode, ct);
		if (course is null)
		{
			return Result<EnrollmentCreated, EnrollmentError>.Failure(
				EnrollmentError.CourseNotFound(command.CourseCode));
		}

		if (course.Enrollments.Count >= course.MaxCapacity)
		{
			return Result<EnrollmentCreated, EnrollmentError>.Failure(
				EnrollmentError.CourseFull(course.Title, course.MaxCapacity));
		}

		if (await enrollmentService.ExistsAsync(command.StudentId, command.CourseCode, ct))
		{
			return Result<EnrollmentCreated, EnrollmentError>.Failure(
				EnrollmentError.AlreadyEnrolled(command.StudentId, command.CourseCode));
		}

		Enrollment enrollment = new()
		{
			StudentId = command.StudentId,
			CourseId = course.Id,
			EnrolledAt = DateTime.UtcNow
		};
		await enrollmentService.AddAsync(enrollment, ct);

		return Result<EnrollmentCreated, EnrollmentError>.Success(
			new EnrollmentCreated(enrollment.Id, enrollment.StudentId, course.Code));
	}
}

