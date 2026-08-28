using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Domain.Entities;

namespace TmsCore.Api.Controllers.V1;

[ApiController]
[Route("api/v{version:apiVersion}/courses")]
[ApiVersion("1.0")]
public sealed class CoursesController(TmsDbContext context) : ControllerBase
{
	[HttpGet]
	public async Task<IActionResult> GetCourses(
		[FromQuery] int page = 1,
		[FromQuery] int pageSize = 20,
		CancellationToken ct = default)
	{
		page = Math.Max(1, page);
		pageSize = Math.Clamp(pageSize, 1, 50);
		IQueryable<Course> baseQuery = context.Courses.AsNoTracking();
		int totalCount = await baseQuery.CountAsync(ct);
		var items = await baseQuery
			.OrderBy(course => course.Title)
			.Skip((page - 1) * pageSize)
			.Take(pageSize)
			.Select(course => new
			{
				course.Id,
				course.Code,
				course.Title,
				course.MaxCapacity,
				EnrollmentCount = course.Enrollments.Count
			})
			.ToListAsync(ct);
		int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
		return Ok(new
		{
			items,
			totalCount,
			page,
			pageSize,
			totalPages,
			hasNext = page < totalPages,
			hasPrevious = page > 1
		});
	}
}

