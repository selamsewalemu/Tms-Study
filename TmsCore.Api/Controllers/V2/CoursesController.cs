using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using TmsCore.Application.Interfaces;
using TmsCore.Application.Dtos;

namespace TmsCore.Api.Controllers.V2;

[ApiController]
[Route("api/v{version:apiVersion}/courses")]
[ApiVersion("2.0")]
public sealed class CoursesController(ICachedCourseService cachedCourseService) : ControllerBase
{
	[HttpGet]
	public async Task<IActionResult> GetCourses(
		[FromQuery] int page = 1,
		[FromQuery] int pageSize = 20,
		CancellationToken ct = default)
	{
		page = Math.Max(1, page);
		pageSize = Math.Clamp(pageSize, 1, 50);
		IReadOnlyList<CourseResponseDto> courses = await cachedCourseService.GetAllCoursesAsync(ct);
		int totalCount = courses.Count;
		IReadOnlyList<CourseResponseDto> rows = courses
			.Skip((page - 1) * pageSize)
			.Take(pageSize)
			.ToList();
		int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
		bool hasNext = page < totalPages;
		bool hasPrevious = page > 1;
		return Ok(new
		{
			data = rows,
			meta = new { totalCount, page, pageSize, totalPages, hasNext, hasPrevious },
			links = new
			{
				self = $"/api/v2/courses?page={page}&pageSize={pageSize}",
				next = hasNext ? $"/api/v2/courses?page={page + 1}&pageSize={pageSize}" : null,
				prev = hasPrevious ? $"/api/v2/courses?page={page - 1}&pageSize={pageSize}" : null,
				enroll = "/api/v2/enrollments"
			}
		});
	}
}
