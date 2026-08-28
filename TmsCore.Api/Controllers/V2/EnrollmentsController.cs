using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TmsCore.Application.Common;
using TmsCore.Application.Enrollments.Commands;
using TmsCore.Application.Enrollments.Queries;

namespace TmsCore.Controllers.V2;

[ApiController]
[Route("api/v{version:apiVersion}/enrollments")]
[ApiVersion("2.0")]
public sealed class EnrollmentsController(IMediator mediator) : ControllerBase
{
	[HttpPost]
	public async Task<IActionResult> Enroll(EnrollStudentCommand command, CancellationToken ct)
	{
		Result<EnrollmentCreated, EnrollmentError> result = await mediator.Send(command, ct);
		return result.Match<IActionResult>(
			created => CreatedAtAction(nameof(GetSchedule), new { studentId = created.StudentId, version = "2.0" }, created),
			error => Problem(
				statusCode: error.Code switch
				{
					"course_not_found" => StatusCodes.Status404NotFound,
					"course_full" or "already_enrolled" => StatusCodes.Status409Conflict,
					_ => StatusCodes.Status400BadRequest
				},
				title: "Enrollment rejected",
				detail: error.Message,
				type: $"https://tms.local/errors/{error.Code}"));
	}

	[HttpGet("{studentId:int}/schedule", Name = nameof(GetSchedule))]
	public async Task<IActionResult> GetSchedule(int studentId, CancellationToken ct)
	{
		ScheduleDto schedule = await mediator.Send(new GetStudentScheduleQuery(studentId), ct);
		return Ok(schedule);
	}
}

