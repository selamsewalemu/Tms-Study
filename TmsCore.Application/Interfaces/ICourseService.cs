using TmsCore.Application.Dtos;
using TmsCore.Domain.Entities;

namespace TmsCore.Application.Interfaces;

// Module 6 Exercise 1: Define the course service boundary used by the controller.
public interface ICourseService
{
	Task<CourseResponseDto?> GetByIdAsync(int id, CancellationToken ct);
	Task<Course?> GetByCodeAsync(string code, CancellationToken ct);
	Task<CourseResponseDto> CreateAsync(CreateCourseRequest request, CancellationToken ct);
	Task<bool> CodeExistsAsync(string code, CancellationToken ct);
	Task<PagedResponse<CourseResponseDto>> GetCoursesAsync(PagedRequest request, CancellationToken ct);
}

