using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;
using TmsCore.Application.Dtos;
using TmsCore.Application.Interfaces;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Infrastructure.Caching;

namespace TmsCore.Infrastructure.Services;

public sealed class CachedCourseService(
	HybridCache cache,
	TmsDbContext context,
	ILogger<CachedCourseService> logger) : ICachedCourseService
{
	public async Task<IReadOnlyList<CourseResponseDto>> GetAllCoursesAsync(CancellationToken ct)
	{
		bool dbHit = false;
		IReadOnlyList<CourseResponseDto> courses = await cache.GetOrCreateAsync(
			CacheKeys.CoursesAll,
			context,
			async (db, token) =>
			{
				dbHit = true;
				logger.LogInformation("Cache MISS for {Key} fetching from DB", CacheKeys.CoursesAll);
				return await db.Courses
					.AsNoTracking()
					.OrderBy(course => course.Title)
					.Select(course => new CourseResponseDto(
						course.Id,
						course.Code,
						course.Title,
						course.MaxCapacity,
						course.Enrollments.Count))
					.ToListAsync(token);
			},
			options: null,
			tags: [CacheKeys.CoursesTag],
			cancellationToken: ct);

		if (!dbHit)
		{
			logger.LogInformation("Cache HIT for {Key}", CacheKeys.CoursesAll);
		}
		return courses;
	}

	public async Task InvalidateCourseCacheAsync(CancellationToken ct)
	{
		logger.LogInformation("Invalidating cache tag {Tag}", CacheKeys.CoursesTag);
		await cache.RemoveByTagAsync(CacheKeys.CoursesTag, ct);
	}
}
