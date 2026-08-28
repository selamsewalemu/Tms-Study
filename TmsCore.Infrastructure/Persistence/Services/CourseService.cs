using Microsoft.EntityFrameworkCore;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Application.Dtos;
using TmsCore.Application.Interfaces;
using TmsCore.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace TmsCore.Infrastructure.Persistence.Services;

// Module 6 Exercise 1 and 2: Query and create courses through DTO projections.
public sealed class CourseService(TmsDbContext context, ILogger<CourseService> logger) : ICourseService
{
	public Task<CourseResponseDto?> GetByIdAsync(int id, CancellationToken ct) =>
		context.Courses.AsNoTracking()
			.Where(course => course.Id == id)
			.Select(course => new CourseResponseDto(course.Id, course.Code, course.Title, course.MaxCapacity, course.Enrollments.Count))
			.FirstOrDefaultAsync(ct);

	public Task<Course?> GetByCodeAsync(string code, CancellationToken ct) =>
		context.Courses
			.Include(course => course.Enrollments)
			.AsNoTracking()
			.FirstOrDefaultAsync(course => course.Code == code, ct);

	public async Task<CourseResponseDto> CreateAsync(CreateCourseRequest request, CancellationToken ct)
	{
		Course course = new() { Code = request.Code, Title = request.Title, MaxCapacity = request.MaxCapacity };
		context.Courses.Add(course);
		await context.SaveChangesAsync(ct);
		logger.LogInformation("Created course {CourseId} ({Code})", course.Id, course.Code);
		return (await GetByIdAsync(course.Id, ct))!;
	}

	public Task<bool> CodeExistsAsync(string code, CancellationToken ct) =>
		context.Courses.AsNoTracking().AnyAsync(course => course.Code == code, ct);

	// Module 6 Exercise 4 Question 3: Filter, count, sort, page, project, and materialize in that order.
	public async Task<PagedResponse<CourseResponseDto>> GetCoursesAsync(PagedRequest request, CancellationToken ct)
	{
		// Question 1: Start with a read-only database query.
		IQueryable<Course> query = context.Courses.AsNoTracking();
		// Question 2: Use PostgreSQL ILike for case-insensitive search over code and title.
		if (!string.IsNullOrWhiteSpace(request.Search))
		{
			string search = $"%{request.Search.Trim()}%";
			query = query.Where(course =>
				EF.Functions.ILike(course.Title, search) ||
				EF.Functions.ILike(course.Code, search));
		}

		// Question 3: Count before Skip and Take so this is the filtered total, not page size.
		int totalCount = await query.CountAsync(ct);
		// Question 4: Whitelist sortable properties and apply the requested direction.
		IOrderedQueryable<Course> sortedQuery = request.OrderBy.ToLowerInvariant() switch
		{
			"code" => request.Descending ? query.OrderByDescending(course => course.Code) : query.OrderBy(course => course.Code),
			"maxcapacity" => request.Descending ? query.OrderByDescending(course => course.MaxCapacity) : query.OrderBy(course => course.MaxCapacity),
			_ => request.Descending ? query.OrderByDescending(course => course.Title) : query.OrderBy(course => course.Title)
		};

		// Question 5: Apply pagination and project directly to the response DTO in SQL.
		List<CourseResponseDto> items = await sortedQuery
			.Skip((request.Page - 1) * request.PageSize)
			.Take(request.PageSize)
			.Select(course => new CourseResponseDto(
				course.Id,
				course.Code,
				course.Title,
				course.MaxCapacity,
				course.Enrollments.Count))
			.ToListAsync(ct);

		// Question 6: Return the bounded items and pagination metadata together.
		return new PagedResponse<CourseResponseDto>
		{
			Items = items,
			TotalCount = totalCount,
			Page = request.Page,
			PageSize = request.PageSize
		};
	}
}

