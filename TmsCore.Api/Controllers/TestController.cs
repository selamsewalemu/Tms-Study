using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Domain.Entities;

namespace TmsCore.Api.Controllers;

// Module 5 Exercise 2: Provide HTTP probes for LINQ execution and translation behavior.
[ApiController]
[Route("api/test")]
public sealed class TestController(TmsDbContext context) : ControllerBase
{
	// Exercise 2 Test 1: Demonstrate deferred execution until ToListAsync materializes the query.
	[HttpGet("deferred")]
	public async Task<IActionResult> TestDeferred()
	{
		Console.WriteLine(">>> TEST 1: Building the query object; no database contact yet.");
		IQueryable<Student> query = context.Students.Where(student => student.GPA >= 3.0m);
		Console.WriteLine(">>> TEST 1: Appending the sorting clause; still no database contact.");
		IOrderedQueryable<Student> orderedQuery = query.OrderBy(student => student.Name);
		Console.WriteLine(">>> TEST 1: Materializing the query; database execution starts now.");
		List<Student> results = await orderedQuery.ToListAsync();
		Console.WriteLine(">>> TEST 1: Materialization finished; list populated.");
		return Ok(results);
	}

	// Exercise 2 Test 2: Demonstrate that an arbitrary C# helper cannot translate to SQL.
	[HttpGet("translation-fail")]
	public async Task<IActionResult> TestTranslationFail()
	{
		try
		{
			List<Student> students = await context.Students
				.Where(student => IsHonorRoll(student.GPA))
				.ToListAsync();
			return Ok(students);
		}
		catch (InvalidOperationException exception)
		{
			Console.WriteLine($">>> TEST 2: Translation failed as expected: {exception.Message}");
			return BadRequest(new { Message = exception.Message });
		}
	}

	// Exercise 2 Test 3: Execute the registrar's translated filter and count query.
	[HttpGet("active-count")]
	public async Task<IActionResult> ActiveCount()
	{
		int count = await context.Students
			.CountAsync(student => student.IsActive && student.GPA >= 3.0m);
		return Ok(new { Count = count });
	}

	// Exercise 2 Test 4: Execute enrollment count, average, and zero-enrollment queries in SQL.
	[HttpGet("registrar")]
	public async Task<IActionResult> RegistrarQueries()
	{
		var mostEnrolledCourses = await context.Courses
			.Select(course => new { course.Title, EnrollmentCount = course.Enrollments.Count })
			.OrderByDescending(course => course.EnrollmentCount)
			.ToListAsync();
		var averageByCourse = await context.Enrollments
			.GroupBy(enrollment => enrollment.Course.Title)
			.Select(group => new { Course = group.Key, AverageGPA = group.Average(enrollment => enrollment.Student.GPA) })
			.ToListAsync();
		var zeroEnrollmentStudents = await context.Students
			.Where(student => !student.Enrollments.Any())
			.Select(student => student.Name)
			.ToListAsync();
		return Ok(new { mostEnrolledCourses, averageByCourse, zeroEnrollmentStudents });
	}

	// Exercise 7 Question 1: Intentionally create 1 + N SQL statements for comparison.
	[HttpGet("n-plus-one")]
	public async Task<IActionResult> NPlusOne(CancellationToken cancellationToken)
	{
		List<Student> students = await context.Students.AsNoTracking().ToListAsync(cancellationToken);
		List<object> report = [];
		foreach (Student student in students)
		{
			int count = await context.Enrollments.AsNoTracking()
				.CountAsync(enrollment => enrollment.StudentId == student.Id, cancellationToken);
			report.Add(new { student.Name, EnrollmentCount = count });
		}

		return Ok(report);
	}

	// Exercise 7 Question 2: Fix N+1 with one shaped query and one database round trip.
	[HttpGet("shaped-enrollment-counts")]
	public async Task<IActionResult> ShapedEnrollmentCounts(CancellationToken cancellationToken)
	{
		var report = await context.Students.AsNoTracking()
			.Select(student => new { student.Name, EnrollmentCount = student.Enrollments.Count })
			.ToListAsync(cancellationToken);
		return Ok(report);
	}

	// Exercise 7 Question 3: Produce SQL pagination with LIMIT and OFFSET.
	[HttpGet("students/page/{page:int}")]
	public async Task<IActionResult> StudentPage(int page, CancellationToken cancellationToken)
	{
		int pageSize = 20;
		int safePage = Math.Max(page, 1);
		List<Student> students = await context.Students.AsNoTracking()
			.OrderBy(student => student.Id)
			.Skip((safePage - 1) * pageSize)
			.Take(pageSize)
			.ToListAsync(cancellationToken);
		return Ok(students);
	}

	// Exercise 8 Question 1: Show normal soft-delete filtering versus an admin override.
	[HttpGet("students/soft-delete-audit")]
	public async Task<IActionResult> SoftDeleteAudit(CancellationToken cancellationToken)
	{
		List<string> visible = await context.Students.Select(student => student.Name).ToListAsync(cancellationToken);
		List<string> includingDeleted = await context.Students.IgnoreQueryFilters()
			.Select(student => student.Name).ToListAsync(cancellationToken);
		return Ok(new { visible, includingDeleted });
	}

	// Exercise 9 Question 1: Archive old enrollments with one set-based UPDATE statement.
	[HttpPost("enrollments/archive")]
	public async Task<IActionResult> ArchiveOldEnrollments(DateTime? cutoff, CancellationToken cancellationToken)
	{
		DateTime archiveBefore = cutoff ?? DateTime.UtcNow.AddYears(-1);
		int archived = await context.Enrollments
			.Where(enrollment => !enrollment.IsArchived && enrollment.EnrolledAt < archiveBefore)
			.ExecuteUpdateAsync(setters => setters.SetProperty(enrollment => enrollment.IsArchived, true), cancellationToken);
		return Ok(new { Archived = archived, Cutoff = archiveBefore });
	}

	// Exercise 8 Question 2: Update a student and let EF detect a stale row-version token.
	[HttpPut("students/{id:int}")]
	public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentRequest request, CancellationToken cancellationToken)
	{
		Student? student = await context.Students.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
		if (student is null)
		{
			return NotFound();
		}

		student.Name = request.Name;
		student.GPA = request.GPA;
		context.Entry(student).Property("LastUpdated").CurrentValue = DateTime.UtcNow;
		await context.SaveChangesAsync(cancellationToken);
		return Ok(student);
	}

	// Exercise 2 Test helper: Keep this method intentionally non-translatable for the failure experiment.
	private static bool IsHonorRoll(decimal gpa) => gpa >= 3.5m;
}

// Exercise 8 Question 2 test input: Keep update fields explicit and bindable from JSON.
public sealed record UpdateStudentRequest(string Name, decimal GPA);
