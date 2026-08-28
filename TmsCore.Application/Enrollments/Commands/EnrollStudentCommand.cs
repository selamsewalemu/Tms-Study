using MediatR;
using TmsCore.Application.Common;

namespace TmsCore.Application.Enrollments.Commands;

public sealed record EnrollStudentCommand(int StudentId, string CourseCode)
	: IRequest<Result<EnrollmentCreated, EnrollmentError>>;

public sealed record EnrollmentCreated(int EnrollmentId, int StudentId, string CourseCode);

