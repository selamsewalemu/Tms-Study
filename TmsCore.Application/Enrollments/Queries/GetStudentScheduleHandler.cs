using MediatR;
using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Enrollments.Queries;

public sealed class GetStudentScheduleHandler(IDatabaseEnrollmentService enrollmentService)
	: IRequestHandler<GetStudentScheduleQuery, ScheduleDto>
{
	public async Task<ScheduleDto> Handle(GetStudentScheduleQuery query, CancellationToken ct)
	{
		var enrollments = await enrollmentService.GetByStudentIdAsync(query.StudentId, ct);
		List<ScheduleItemDto> items = enrollments
			.Select(enrollment => new ScheduleItemDto(
				enrollment.Course.Code,
				enrollment.Course.Title,
				"TBD"))
			.ToList();
		return new ScheduleDto(query.StudentId, items);
	}
}

