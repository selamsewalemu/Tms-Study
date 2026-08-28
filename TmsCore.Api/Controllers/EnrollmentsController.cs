using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Metadata;
using TmsCore.Application.Dtos;
using TmsCore.Application.Interfaces;

namespace TmsCore.Api.Controllers;

// Module 6 Exercise 3: Expose enrollments as a resource nested under a course.
[ApiController]
[Route("api/courses/{courseId:int}/enrollments")]
[Tags("Enrollments")]
[Produces("application/json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class EnrollmentsController(
	ICourseService courseService,
	IDatabaseEnrollmentService enrollmentService) : ControllerBase
{
	// Exercise 3 Question 1: Fetch an enrollment only within its parent course.
	[HttpGet(Name = "ListCourseEnrollments")]
	[ProducesResponseType(typeof(IReadOnlyList<EnrollmentResponseDto>), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
	[EndpointSummary("List enrolments for a course")]
	public async Task<IActionResult> GetEnrollments(int courseId, CancellationToken ct)
	{
		CourseResponseDto? course = await courseService.GetByIdAsync(courseId, ct);
		if (course is null)
		{
			return NotFound();
		}

		return Ok(await enrollmentService.GetByCourseAsync(courseId, ct));
	}

	// Exercise 3 Question 1: Fetch an enrollment only within its parent course.
	[HttpGet("{id:int}", Name = nameof(GetEnrollment))]
	[ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
	[EndpointSummary("Get one enrolment for a course")]
	public async Task<IActionResult> GetEnrollment(int courseId, int id, CancellationToken ct)
	{
		EnrollmentResponseDto? enrollment = await enrollmentService.GetByIdAsync(courseId, id, ct);
		return enrollment is not null ? Ok(enrollment) : NotFound();
	}

	// Exercise 3 Question 2: Return 404 for a missing course before checking capacity.
	[HttpPost]
	[ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status201Created)]
	[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
	[EndpointSummary("Enrol a student in a course")]
	[EndpointDescription("Returns 404 when the course does not exist and 409 when it has reached MaxCapacity.")]
	public async Task<IActionResult> EnrollStudent(int courseId, EnrollStudentRequest request, CancellationToken ct)
	{
		CourseResponseDto? course = await courseService.GetByIdAsync(courseId, ct);
		if (course is null)
		{
			return NotFound();
		}

		if (course.EnrollmentCount >= course.MaxCapacity)
		{
			return Conflict(new ProblemDetails
			{
				Title = "Course is full",
				Detail = $"Course '{course.Title}' has reached its maximum capacity of {course.MaxCapacity}.",
				Status = StatusCodes.Status409Conflict
			});
		}

		EnrollmentResponseDto enrollment = await enrollmentService.CreateAsync(courseId, request, ct);
		return CreatedAtAction(nameof(GetEnrollment), new { courseId, id = enrollment.Id }, enrollment);
	}
}

