using TmsCore.Application.Dtos;
using TmsCore.Domain.Entities;

namespace TmsCore.Application.Interfaces;

// Module 6 Exercise 3: Define the nested database enrollment service contract.
public interface IDatabaseEnrollmentService
{
	Task<EnrollmentResponseDto?> GetByIdAsync(int courseId, int id, CancellationToken ct);
	Task<IReadOnlyList<EnrollmentResponseDto>> GetByCourseAsync(int courseId, CancellationToken ct);
	Task<bool> ExistsAsync(int studentId, string courseCode, CancellationToken ct);
	Task AddAsync(Enrollment enrollment, CancellationToken ct);
	Task<IReadOnlyList<Enrollment>> GetByStudentIdAsync(int studentId, CancellationToken ct);
	Task<EnrollmentResponseDto> CreateAsync(int courseId, EnrollStudentRequest request, CancellationToken ct);
}

