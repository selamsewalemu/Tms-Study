using TmsCore.Application.Models;

namespace TmsCore.Application.Interfaces;

// Module 4 Exercise 2: Define the scoped enrollment service contract.
public interface IEnrollmentService
{
	Task<EnrollmentRecord> EnrollAsync(string studentId, string courseCode);
	Task<EnrollmentRecord?> GetByIdAsync(string id);
	Task<IReadOnlyList<EnrollmentRecord>> GetAllAsync();
	Task<bool> DeleteAsync(string id);
}

