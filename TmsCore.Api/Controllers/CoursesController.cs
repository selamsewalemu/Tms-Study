using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Routing;
using TmsCore.Api.Authorization;
using TmsCore.Application.Dtos;
using TmsCore.Application.Interfaces;

namespace TmsCore.Api.Controllers;

// Module 6 Exercise 1 and 2: Expose the predictable course REST contract.
[ApiController]
[Route("api/courses")]
[Tags("Courses")]
[Produces("application/json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class CoursesController(
	ICourseService courseService,
	LinkGenerator linkGenerator,
	ICachedCourseService cachedCourseService) : ControllerBase
{
	// Exercise 4 Question 1: Read page, size, search, and ordering from the query string.
	[HttpGet]
	[ProducesResponseType(typeof(PagedResponse<CourseResponseDto>), StatusCodes.Status200OK)]
	[EndpointSummary("List courses with pagination")]
	[EndpointDescription("Returns a paginated, optionally filtered list of TMS courses. PageSize is capped at 50.")]
	public async Task<IActionResult> GetCourses([FromQuery] PagedRequest request, CancellationToken ct)
	{
		PagedResponse<CourseResponseDto> result = await courseService.GetCoursesAsync(request, ct);
		return Ok(result);
	}

	// Exercise 1 Question 1: Fetch one course or return 404 when it does not exist.
	[HttpGet("{id:int}", Name = nameof(GetCourseById))]
	[ProducesResponseType(typeof(CourseDetailDto), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
	[EndpointSummary("Get a course by ID")]
	[EndpointDescription("Returns course details with HATEOAS links and a 404 when the course does not exist.")]
	public async Task<IActionResult> GetCourseById(int id, CancellationToken ct)
	{
		CourseResponseDto? course = await courseService.GetByIdAsync(id, ct);
		if (course is null)
		{
			return NotFound();
		}

		string coursePath = linkGenerator.GetPathByName(HttpContext, nameof(GetCourseById), new { id })!;
		string enrollmentsPath = linkGenerator.GetPathByName(
			HttpContext,
			"ListCourseEnrollments",
			new { courseId = id })!;
		List<LinkDto> links =
		[
			new(coursePath, "self", "GET"),
			new(coursePath, "update", "PUT"),
			new(coursePath, "delete", "DELETE"),
			new(enrollmentsPath, "enrollments", "GET")
		];
		if (course.EnrollmentCount < course.MaxCapacity)
		{
			links.Add(new LinkDto(enrollmentsPath, "enroll", "POST"));
		}

		CourseDetailDto detail = new()
		{
			Id = course.Id,
			Code = course.Code,
			Title = course.Title,
			MaxCapacity = course.MaxCapacity,
			EnrollmentCount = course.EnrollmentCount,
			Links = links
		};
		return Ok(detail);
	}

	// Exercise 1 Question 2 and Exercise 3 Question 1: Create or reject a duplicate course code.
	[HttpPost]
	[Authorize]
	[ProducesResponseType(typeof(CourseResponseDto), StatusCodes.Status201Created)]
	[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
	[EndpointSummary("Create a new course")]
	[EndpointDescription("Creates a course with a unique code and returns 409 when the code already exists.")]
	public async Task<IActionResult> CreateCourse(CreateCourseRequest request, CancellationToken ct)
	{
		if (await courseService.CodeExistsAsync(request.Code, ct))
		{
			return Conflict(new ProblemDetails
			{
				Title = "Course code already exists",
				Detail = $"A course with code '{request.Code}' is already registered.",
				Status = StatusCodes.Status409Conflict
			});
		}

		CourseResponseDto result = await courseService.CreateAsync(request, ct);
		await cachedCourseService.InvalidateCourseCacheAsync(ct);
		return CreatedAtAction(nameof(GetCourseById), new { id = result.Id }, result);
	}

	[HttpDelete("{id:int}")]
	[Authorize(Policy = "CourseOwner")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
	public async Task<IActionResult> DeleteCourse(int id, CancellationToken ct)
	{
		CourseResponseDto? course = await courseService.GetByIdAsync(id, ct);
		if (course is null)
			return NotFound();

		string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
		var resource = new CourseResource(course.Id, userId ?? string.Empty);
		if (userId is null)
			return Forbid();

		var authorizationService = HttpContext.RequestServices.GetRequiredService<IAuthorizationService>();
		AuthorizationResult authorization = await authorizationService.AuthorizeAsync(User, resource, "CourseOwner");
		if (!authorization.Succeeded)
			return Forbid();

		return NoContent();
	}
}
