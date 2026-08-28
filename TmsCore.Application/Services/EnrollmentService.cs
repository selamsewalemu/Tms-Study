using TmsCore.Application.Models;
using TmsCore.Application.Exceptions;
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Services;

public class EnrollmentService : IEnrollmentService
{
    private static readonly ConcurrentDictionary<string, EnrollmentRecord> Store = new();
    private readonly ILogger<EnrollmentService>? _logger;

    public EnrollmentService(ILogger<EnrollmentService>? logger = null)
    {
        _logger = logger;
    }

    public Action<Student>? Listener { get; set; }

    public EnrollmentRecord ProcessRegistration(
        Student? student,
        Course? course)
    {
        ArgumentNullException.ThrowIfNull(student);
        ArgumentNullException.ThrowIfNull(course);

        if (course.EnrolledCount >= course.Capacity)
        {
            throw new CapacityReachedException(course.Code);
        }

        string standing = student.GPA switch
        {
            >= 3.5m => "Honors",
            >= 2.5m => "Good Standing",
            _ => "Academic Warning"
        };

        Console.WriteLine($"{student.Name} is in {standing}.");
        course.EnrolledCount++;

        return new EnrollmentRecord
        {
            StudentId = student.Id,
            CourseCode = string.IsNullOrEmpty(course.Code)
                ? course.CourseCode
                : course.Code,
            EnrollmentDate = DateTime.UtcNow
        };
    }

    public void FinalizeEnrollment(Student student)
    {
        Console.WriteLine("Persisting to database...");
        Listener?.Invoke(student);
    }

    public Task<EnrollmentRecord> EnrollAsync(string studentId, string courseCode)
    {
        EnrollmentRecord? existing = Store.Values.FirstOrDefault(record =>
            record.StudentId == studentId && record.CourseCode == courseCode);
        if (existing is not null)
        {
            _logger?.LogWarning(
                "Duplicate enrollment attempt {StudentId} already in {CourseCode} (record {EnrollmentId})",
                studentId,
                courseCode,
                existing.Id);
            return Task.FromResult(existing);
        }

        string id = Guid.NewGuid().ToString("N")[..8];
        EnrollmentRecord record = new()
        {
            Id = id,
            StudentId = studentId,
            CourseCode = courseCode,
            EnrollmentDate = DateTime.UtcNow
        };
        Store[id] = record;
        _logger?.LogInformation(
            "Enrolled {StudentId} in {CourseCode} record {EnrollmentId}",
            studentId,
            courseCode,
            id);
        return Task.FromResult(record);
    }

    public Task<EnrollmentRecord?> GetByIdAsync(string id)
    {
        Store.TryGetValue(id, out EnrollmentRecord? record);
        if (record is null)
        {
            _logger?.LogWarning("Enrollment {EnrollmentId} not found", id);
        }

        return Task.FromResult(record);
    }

    public Task<IReadOnlyList<EnrollmentRecord>> GetAllAsync()
    {
        IReadOnlyList<EnrollmentRecord> all = Store.Values.ToList();
        return Task.FromResult(all);
    }

    public Task<bool> DeleteAsync(string id)
    {
        bool removed = Store.TryRemove(id, out _);
        if (removed)
        {
            _logger?.LogInformation("Deleted enrollment {EnrollmentId}", id);
        }
        else
        {
            _logger?.LogWarning("Delete failed enrollment {EnrollmentId} not found", id);
        }

        return Task.FromResult(removed);
    }
}

