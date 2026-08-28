using TmsCore.Application.Dtos;

namespace TmsCore.Application.Interfaces;

public interface ICachedCourseService
{
	Task<IReadOnlyList<CourseResponseDto>> GetAllCoursesAsync(CancellationToken ct);
	Task InvalidateCourseCacheAsync(CancellationToken ct);
}
