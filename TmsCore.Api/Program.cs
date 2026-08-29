using System.Diagnostics;
using System.Threading.Channels;
using System.Threading.RateLimiting;
using Asp.Versioning;
using FluentValidation;
using MediatR;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using TmsCore;
using TmsCore.Infrastructure.Persistence;
using TmsCore.Filters;
using DbCourse = TmsCore.Domain.Entities.Course;
using DbEnrollment = TmsCore.Domain.Entities.Enrollment;
using DbStudent = TmsCore.Domain.Entities.Student;
using TmsCore.Application.Models;
using TmsCore.Application.Interfaces;
using TmsCore.Application.Services;
using TmsCore.Application.Transcripts;
using TmsCore.Application.Notifications;
using TmsCore.Infrastructure.Persistence.Services;
using TmsCore.Infrastructure.Services;
using TmsCore.Infrastructure.Caching;
using TmsCore.Infrastructure.Transcripts;
using TmsCore.Infrastructure.Workers;
using TmsCore.Api.RateLimiting;
using TmsCore.Api.Hubs;
using TmsCore.Api.Notifications;
using TmsCore.Application.Exceptions;
using TmsCore.Infrastructure.Identity;
using TmsCore.Application.Behaviors;
using TmsCore.Application.Enrollments.Commands;
using TmsCore.ExceptionHandlers;
using TmsCore.Middleware;
using TmsCore.Api.Authorization;

Console.WriteLine("==============================================");
Console.WriteLine(" Training Management System (TMS)");
Console.WriteLine(" Module 1 - Lab Session 1");
Console.WriteLine(" Exercise 1 - The First Safety Net");
Console.WriteLine("==============================================");

Console.WriteLine();
Console.WriteLine("STEP 1 - Null Safety");
Console.WriteLine("--------------------------------");

string? region = null;
string? upperRegion = region?.ToUpper();
string displayRegion = region ?? "Unassigned";
region ??= "Addis Ababa";

Console.WriteLine($"Region (conditional): {upperRegion}");
Console.WriteLine($"Region (coalesced): {displayRegion}");
Console.WriteLine($"Region (assigned): {region}");

Console.WriteLine();
Console.WriteLine("STEP 2 - Student Information");
Console.WriteLine("--------------------------------");

string firstStudentName = "Abeba";
string firstStudentId = "STU-001";
int firstEnrollmentCount = 3;
decimal firstGrantAmount = 1999.99m;
DateTime firstEnrolledAt = DateTime.UtcNow;
string? firstCampusRegion = null;

Console.WriteLine($"Student : {firstStudentName}");
Console.WriteLine($"ID      : {firstStudentId}");
Console.WriteLine($"Courses : {firstEnrollmentCount}");
Console.WriteLine($"Grant   : {firstGrantAmount:F2}");
Console.WriteLine($"Date    : {firstEnrolledAt:yyyy-MM-dd}");
Console.WriteLine($"Campus  : {firstCampusRegion ?? "Not assigned"}");

Console.WriteLine();
Console.WriteLine("STEP 3 - Double vs Decimal");
Console.WriteLine("--------------------------------");

double grantPerStudentDouble = 1999.99;
double totalAllocationDouble = grantPerStudentDouble * 100000;
decimal grantPerStudentDecimal = 1999.99m;
decimal totalAllocationDecimal = grantPerStudentDecimal * 100000m;

Console.WriteLine($"Double total   : {totalAllocationDouble}");
Console.WriteLine($"Decimal total  : {totalAllocationDecimal:F2}");

Console.WriteLine();
Console.WriteLine("STEP 4 - Grant Calculation");
Console.WriteLine("--------------------------------");

int correctAnswers = 85;
int totalQuestions = 100;
decimal calculatedGrant = (decimal)correctAnswers / totalQuestions * 1000m;
Console.WriteLine($"Grant Amount: {calculatedGrant:F2}");

Console.WriteLine();

Console.WriteLine("==============================");
Console.WriteLine(" TMS Enrollment Tests");
Console.WriteLine("==============================");

EnrollmentService service = new();

Student student = new()
{
	Id = "S1",
	Name = "Abeba",
	Age = 20,
	GPA = 3.8m
};

Course course = new()
{
	Code = "CS-401",
	Title = "Advanced C#",
	Capacity = 30,
	EnrolledCount = 0
};

EnrollmentRecord result = service.ProcessRegistration(student, course);
Console.WriteLine($"Enrolled: {result.StudentId} in {result.CourseCode}");

// Session 2 Checkpoint 1: null student reports parameter name "student".
try
{
	service.ProcessRegistration(null, course);
}
catch (ArgumentNullException ex)
{
	Console.WriteLine($"Guard caught: {ex.ParamName}");
}

Course fullCourse = new()
{
	Code = "CS-402",
	Title = "Full Course",
	Capacity = 1,
	EnrolledCount = 1
};

try
{
	service.ProcessRegistration(student, fullCourse);
}
catch (InvalidOperationException ex)
{
	Console.WriteLine($"Business rule: {ex.Message}");
}

Console.WriteLine();
Console.WriteLine("===== Grade Reports =====");

IGradable quiz = new Quiz
{
	CorrectAnswers = 8,
	TotalQuestions = 10
};

IGradable lab = new LabAssignment
{
	Score = 95m
};

GradeReportService.PrintGradeReport(quiz);
GradeReportService.PrintGradeReport(lab);

Console.WriteLine();
Console.WriteLine("===== Student Collection =====");

// C# 12+ collection expression: the modern way to initialize lists.
List<Student> students =
[
	new Student { Id = "S1", Name = "Abeba", Age = 22, GPA = 3.8m },
	new Student { Id = "S2", Name = "Kidane", Age = 21, GPA = 2.4m },
	new Student { Id = "S3", Name = "Dawit", Age = 20, GPA = 3.1m },
	new Student { Id = "S4", Name = "Sara", Age = 23, GPA = 3.9m },
	new Student { Id = "S5", Name = "Frehiwot", Age = 19, GPA = 2.0m },
	new Student { Id = "S6", Name = "Yonas", Age = 24, GPA = 3.5m },
	new Student { Id = "S7", Name = "Meron", Age = 22, GPA = 1.8m },
	new Student { Id = "S8", Name = "Tesfaye", Age = 21, GPA = 2.9m }
];

foreach (Student currentStudent in students)
{
	Console.WriteLine(
		$"{currentStudent.Id}: {currentStudent.Name}, Age {currentStudent.Age}, GPA {currentStudent.GPA:F1}");
}

Console.WriteLine();
Console.WriteLine("===== Honors Students =====");

// Session 2 Checkpoint 2: filter and sort honors students by GPA descending.
var honorsStudents = students
	.Where(studentEntry => studentEntry.GPA >= 3.5m);

foreach (var entry in honorsStudents)
{
	Console.WriteLine($"{entry.Name} : {entry.GPA:F1}");
}

var leaderboard = honorsStudents
	.OrderByDescending(studentEntry => studentEntry.GPA)
	.Select(studentEntry => studentEntry.Name)
	.ToList();

Console.WriteLine($"Found {leaderboard.Count} Honors Students:");

foreach (var name in leaderboard)
{
	Console.WriteLine($"- {name}");
}

Console.WriteLine();
Console.WriteLine("===== Class Statistics =====");

// Session 2 Checkpoint 3a: calculate the average GPA across all students.
decimal averageGpa = students.Average(studentEntry => studentEntry.GPA);
Console.WriteLine($"\nClass Average GPA: {averageGpa:F2}");

// Session 2 Checkpoint 3b: group students by their academic standing.
var standingGroups = students.GroupBy(studentEntry => studentEntry.GPA switch
{
	>= 3.5m => "Honors",
	>= 2.5m => "Good Standing",
	>= 2.0m => "Probation",
	_ => "Academic Warning"
});

Console.WriteLine("\n--- Academic Standing Report ---");
foreach (var group in standingGroups)
{
	Console.WriteLine($"\n{group.Key} ({group.Count()}):");
	foreach (var currentStudent in group)
	{
		Console.WriteLine($"  {currentStudent.Name} GPA: {currentStudent.GPA:F1}");
	}
}

// Session 2 Checkpoint 4: merge course arrays with collection spread expressions.
string[] backendCourses = ["C#", "ASP.NET Core"];
string[] frontendCourses = ["TypeScript", "Angular"];
string[] allCourses = [..backendCourses, ..frontendCourses, "SQL"];

Console.WriteLine($"\nFull curriculum: {string.Join(", ", allCourses)}");

// ==========================================================
// Session 3 - Async Performance
// ==========================================================

// Step 1: Compare blocking, sequential async, and parallel async work.
// Simulate five database calls, each taking 300 milliseconds.

// Blocking sequential: the thread is held during every wait.
Stopwatch stopwatch = Stopwatch.StartNew();
for (int index = 0; index < 5; index++)
{
	Thread.Sleep(300);
}

Console.WriteLine($"Blocking sequential: {stopwatch.ElapsedMilliseconds}ms");

// Async sequential: the thread is released, but calls still run one at a time.
stopwatch.Restart();
for (int index = 0; index < 5; index++)
{
	await Task.Delay(300);
}

Console.WriteLine($"Async sequential: {stopwatch.ElapsedMilliseconds}ms");

// Async parallel: all five calls start at the same time.
stopwatch.Restart();
var tasks = Enumerable.Range(0, 5).Select(_ => Task.Delay(300));
await Task.WhenAll(tasks);

Console.WriteLine($"Async parallel: {stopwatch.ElapsedMilliseconds}ms");

// Step 2: Simulate loading one student from a database asynchronously.
Student fetchedStudent = await FetchStudentAsync("S3");
Console.WriteLine($"Loaded: {fetchedStudent.Name}, GPA {fetchedStudent.GPA:F1}");

async Task<Student> FetchStudentAsync(string id)
{
	Console.WriteLine($" Fetching {id}...");
	await Task.Delay(300); // Simulate database latency

	return new Student
	{
		Id = id,
		Name = $"Student-{id}",
		Age = 20,
		GPA = id switch
		{
			"S1" => 3.8m,
			"S2" => 2.4m,
			"S3" => 3.5m,
			"S4" => 1.9m,
			"S5" => 3.2m,
			_ => 2.5m
		}
	};
}

// Step 3: Simulate loading a course from a database asynchronously.
async Task<Course> FetchCourseAsync(string code)
{
	Console.WriteLine($" Fetching course {code}...");
	await Task.Delay(200); // Simulate database latency

	return new Course
	{
		Code = code,
		Title = $"Course-{code}",
		Capacity = code switch
		{
			"CRS-101" => 2,
			"CRS-201" => 30,
			"CRS-301" => 15,
			_ => 25
		}
	};
}

// Step 4: Start all student and course fetches before awaiting either group.
stopwatch.Restart();
string[] studentIds = ["S1", "S2", "S3", "S4", "S5"];
string[] courseCodes = ["CRS-101", "CRS-201", "CRS-301"];

var studentTasks = studentIds
	.Select(id => FetchStudentAsync(id))
	.ToArray();
var courseTasks = courseCodes
	.Select(code => FetchCourseAsync(code))
	.ToArray();

Student[] fetchedStudents = await Task.WhenAll(studentTasks);
Course[] courses = await Task.WhenAll(courseTasks);

Console.WriteLine(
	$"\nLoaded {fetchedStudents.Length} students and {courses.Length} courses in "
	+ $"{stopwatch.ElapsedMilliseconds}ms");

foreach (var fetchedEntry in fetchedStudents)
{
	Console.WriteLine($" {fetchedEntry.Name} GPA: {fetchedEntry.GPA:F1}");
}

// ==========================================================
// Exercise 6 Part B: The TMS Enrollment Engine
// Load students in parallel, then track enrollments and failures.
// ==========================================================

// Create a course with a capacity limit and result collections.
Course enrollCourse = new()
{
	Code = "CRS-101",
	Title = "C# Mastery",
	Capacity = 2
};

EnrollmentService enrollService = new();
List<EnrollmentRecord> enrollments = [];
List<string> failures = [];

// Attempt to enroll each fetched student and record the outcome.
foreach (var fetchedEntry in fetchedStudents)
{
	try
	{
		EnrollmentRecord record = enrollService.ProcessRegistration(
			fetchedEntry,
			enrollCourse);

		// ProcessRegistration updates EnrolledCount after success.
		enrollments.Add(record);
		Console.WriteLine($" Enrolled: {fetchedEntry.Name}");
		_ = SendConfirmationAsync(fetchedEntry);
	}
	catch (CapacityReachedException ex)
	{
		// Keep rejected students and the reason for the failure.
		failures.Add($"{fetchedEntry.Name}: {ex.Message}");
		Console.WriteLine($" Rejected: {fetchedEntry.Name} {ex.Message}");
	}
}

Console.WriteLine(
	$"Enrollment complete: {enrollments.Count} enrolled, "
	+ $"{failures.Count} rejected in {stopwatch.ElapsedMilliseconds}ms");

// Exercise 7: Catch the domain exception and read its course context.
try
{
	Course overflowCourse = new()
	{
		Code = "CRS-999",
		Title = "Overflow Test",
		Capacity = 0
	};

	enrollService.ProcessRegistration(
		new Student { Id = "S99", Name = "Test", Age = 20, GPA = 3.0m },
		overflowCourse);
}
catch (CapacityReachedException ex)
{
	Console.WriteLine("\nDomain exception caught:");
	Console.WriteLine($" Course: {ex.CourseCode}");
	Console.WriteLine($" Message: {ex.Message}");
}

// Exercise 7B: Print one summary for the complete enrollment run.
stopwatch.Stop();
decimal classAverage = fetchedStudents.Length > 0
	? fetchedStudents.Average(fetchedEntry => fetchedEntry.GPA)
	: 0m;

Console.WriteLine("\n========== ENROLLMENT SUMMARY ==========");
Console.WriteLine($"Total students loaded: {fetchedStudents.Length}");
Console.WriteLine($"Successful enrollments: {enrollments.Count}");
Console.WriteLine($"Failed enrollments: {failures.Count}");
Console.WriteLine($"Class average GPA: {classAverage:F2}");
Console.WriteLine($"Total elapsed time: {stopwatch.ElapsedMilliseconds}ms");

if (failures.Count > 0)
{
	Console.WriteLine("\n--- Failure Details ---");
	foreach (var failure in failures)
	{
		Console.WriteLine($" {failure}");
	}
}

Console.WriteLine("========================================");

// Optional Exercise 6B: safely send confirmation notifications in the background.
async Task SendConfirmationAsync(Student confirmationStudent)
{
	try
	{
		await Task.Delay(100); // Simulate sending email
		Console.WriteLine($" Email sent to {confirmationStudent.Name}");
	}
	catch (Exception ex)
	{
		// Log the failure without re-throwing from fire-and-forget work.
		Console.WriteLine(
			$" Email failed for {confirmationStudent.Name}: {ex.Message}");
	}
}

// Optional extension: announce a finalized enrollment through a delegate.
enrollService.Listener = listenerStudent =>
	Console.WriteLine($"SMS SENT: Welcome to the TMS, {listenerStudent.Name}!");
enrollService.FinalizeEnrollment(fetchedStudents[0]);

// ==========================================================
// Module 4: ASP.NET Core 10 Fundamentals
// ==========================================================

// Exercise 1: Build a protected assessment endpoint with the correct pipeline order.
WebApplicationBuilder webBuilder = WebApplication.CreateBuilder(args);
webBuilder.Host.UseDefaultServiceProvider(options =>
{
	options.ValidateScopes = true;
	options.ValidateOnBuild = true;
});
webBuilder.Services.AddScoped<TokenService>();
webBuilder.Services
	.AddAuthentication(options =>
	{
		options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
		options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
	})
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true,
			ValidIssuer = webBuilder.Configuration["Jwt:Issuer"],
			ValidAudience = webBuilder.Configuration["Jwt:Audience"],
			IssuerSigningKey = new SymmetricSecurityKey(
				Encoding.UTF8.GetBytes(webBuilder.Configuration["Jwt:Key"]!))
		};
	});
webBuilder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CourseOwner", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(new CourseOwnerRequirement());
    });
});
webBuilder.Services.AddSingleton<IAuthorizationHandler, CourseOwnerAuthorizationHandler>();
webBuilder.Services.AddIdentityCore<TmsUser>(options =>
{
	options.Password.RequiredLength = 12;
	options.Password.RequireUppercase = true;
	options.Password.RequireDigit = true;
	options.Password.RequireNonAlphanumeric = true;
	options.Lockout.MaxFailedAccessAttempts = 5;
	options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
	options.Lockout.AllowedForNewUsers = true;
})
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<TmsDbContext>();
webBuilder.Services.AddAntiforgery(options =>
{
	options.HeaderName = "X-XSRF-TOKEN";
});
var allowedOrigins = webBuilder.Configuration
	.GetSection("AllowedOrigins").Get<string[]>()
	?? ["http://localhost:4200"];

webBuilder.Services.AddCors(options =>
{
	options.AddPolicy("TmsClient", policy =>
	{
		policy.WithOrigins(allowedOrigins)
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials()
			.SetPreflightMaxAge(TimeSpan.FromMinutes(10));
	});
});
webBuilder.Services.AddProblemDetails(options =>
{
	options.CustomizeProblemDetails = context =>
	{
		IExceptionHandlerFeature? exceptionFeature = context.HttpContext.Features
			.Get<IExceptionHandlerFeature>();
		context.ProblemDetails.Detail = exceptionFeature?.Error.Message
			?? "The request could not be completed.";
	};
});
webBuilder.Services.AddSignalR();
webBuilder.Services.AddSingleton<ITranscriptStatusStore, InMemoryTranscriptStatusStore>();
webBuilder.Services.AddSingleton(Channel.CreateBounded<TranscriptRequest>(new BoundedChannelOptions(100)
{
	FullMode = BoundedChannelFullMode.Wait
}));
webBuilder.Services.AddSingleton<ITranscriptNotificationService, SignalRTranscriptNotificationService>();
webBuilder.Services.AddHostedService<TranscriptWorker>();
// Module 6 Exercise 4 Part D: Register the audit filter for every controller action.
webBuilder.Services.AddControllers(options =>
{
	options.Filters.Add<AuditLogFilter>();
});
webBuilder.Services.AddOpenApi("v1", options => options.ShouldInclude = description => description.GroupName == "v1");
webBuilder.Services.AddOpenApi("v2", options => options.ShouldInclude = description => description.GroupName == "v2");
webBuilder.Services.AddApiVersioning(options =>
{
	options.DefaultApiVersion = new ApiVersion(1, 0);
	options.AssumeDefaultVersionWhenUnspecified = true;
	options.ReportApiVersions = true;
	options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
	options.GroupNameFormat = "'v'VVV";
	options.SubstituteApiVersionInUrl = true;
});
webBuilder.Services.AddHybridCache(options =>
{
	options.DefaultEntryOptions = new HybridCacheEntryOptions
	{
		Expiration = TimeSpan.FromMinutes(10),
		LocalCacheExpiration = TimeSpan.FromMinutes(2)
	};
});
webBuilder.Services.AddRateLimiter(options =>
{
	options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
	{
		(string partitionKey, ApiKeyTier tier) = ApiKeyResolver.Resolve(context);
		return tier switch
		{
			ApiKeyTier.Paid => RateLimitPartition.GetTokenBucketLimiter(
				$"paid:{partitionKey}", _ => new TokenBucketRateLimiterOptions
				{
					TokenLimit = 200,
					TokensPerPeriod = 100,
					ReplenishmentPeriod = TimeSpan.FromSeconds(10),
					QueueLimit = 0,
					AutoReplenishment = true
				}),
			ApiKeyTier.Free => RateLimitPartition.GetTokenBucketLimiter(
				$"free:{partitionKey}", _ => new TokenBucketRateLimiterOptions
				{
					TokenLimit = 30,
					TokensPerPeriod = 10,
					ReplenishmentPeriod = TimeSpan.FromSeconds(10),
					QueueLimit = 0,
					AutoReplenishment = true
				}),
			_ => RateLimitPartition.GetTokenBucketLimiter(
				$"anon:{partitionKey}", _ => new TokenBucketRateLimiterOptions
				{
					TokenLimit = 10,
					TokensPerPeriod = 5,
					ReplenishmentPeriod = TimeSpan.FromSeconds(10),
					QueueLimit = 0,
					AutoReplenishment = true
				})
		};
	});
	options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
		partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
		factory: _ => new FixedWindowRateLimiterOptions
		{
			PermitLimit = 5,
			Window = TimeSpan.FromMinutes(1),
			QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
			QueueLimit = 0,
			AutoReplenishment = true
		}));
	options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
	options.OnRejected = async (context, ct) =>
	{
		string retryAfter = "1";
		if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out TimeSpan retryAfterTime))
		{
			retryAfter = Math.Max(1, (int)Math.Ceiling(retryAfterTime.TotalSeconds)).ToString();
		}
		context.HttpContext.Response.Headers.RetryAfter = retryAfter;
		context.HttpContext.Response.ContentType = "application/problem+json";
		await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
		{
			Title = "Rate limit exceeded",
			Detail = $"Too many requests. Retry after {retryAfter} seconds.",
			Status = StatusCodes.Status429TooManyRequests,
			Type = "https://tms.local/errors/rate_limit_exceeded"
		}, ct);
	};
	options.AddConcurrencyLimiter("transcripts", limiterOptions =>
	{
		limiterOptions.PermitLimit = 5;
		limiterOptions.QueueLimit = 20;
		limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
	});
});
webBuilder.Services.AddMediatR(configuration =>
	configuration.RegisterServicesFromAssembly(typeof(EnrollStudentHandler).Assembly));
webBuilder.Services.AddValidatorsFromAssembly(typeof(EnrollStudentValidator).Assembly);
webBuilder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
webBuilder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
webBuilder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Module 5 Exercise 1: Register the PostgreSQL-backed context as scoped per request.
webBuilder.Services.AddDbContext<TmsDbContext>(options =>
{
	options.UseNpgsql(webBuilder.Configuration.GetConnectionString("TmsDatabase"));
	if (webBuilder.Environment.IsDevelopment())
	{
		options.LogTo(Console.WriteLine, LogLevel.Information);
		options.EnableSensitiveDataLogging();
	}
});

// Exercise 2: Register the worker as singleton and the enrollment service as scoped.
webBuilder.Services.AddSingleton<EnrollmentWorker>();
webBuilder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
webBuilder.Services.AddScoped<ICourseService, CourseService>();
webBuilder.Services.AddScoped<IDatabaseEnrollmentService, DatabaseEnrollmentService>();
webBuilder.Services.AddScoped<ICachedCourseService, CachedCourseService>();

// Exercise 3: Fail at startup when required payment configuration is invalid.
webBuilder.Services.AddOptions<PaymentOptions>()
	.BindConfiguration("Payments")
	.ValidateDataAnnotations()
	.ValidateOnStart();

WebApplication webApp = webBuilder.Build();

// Exercise 1B: Keep logging outside the rest of the pipeline so every request is observable.
webApp.UseMiddleware<RequestLoggingMiddleware>();
webApp.UseExceptionHandler();
webApp.UseMiddleware<V1DeprecationMiddleware>();
webApp.UseStatusCodePages();
webApp.UseHttpsRedirection();
webApp.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';";
    await next();
});
webApp.UseRouting();
webApp.UseCors("TmsClient");
webApp.UseRateLimiter();
webApp.UseAuthentication();
webApp.UseAuthorization();
webApp.Use(async (context, next) =>
{
	if (context.User.Identity?.IsAuthenticated == true || context.Request.Cookies.ContainsKey("tms_auth"))
	{
		var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
		var tokens = antiforgery.GetAndStoreTokens(context);
		context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
		{
			HttpOnly = false,
			Secure = !webApp.Environment.IsDevelopment(),
			SameSite = SameSiteMode.Strict
		});
	}

	await next(context);
});
webApp.MapHub<TmsHub>("/hubs/tms").RequireCors("TmsClient");

// Exercise 1: Require authentication before returning confidential assessment results.
webApp.MapGet("/api/assessments/results", () => Results.Ok(new
{
	courseCode = "CS-101",
	studentId = "S-001",
	letterGrade = "A"
})).RequireAuthorization();

// Exercise 2: Smoke-test scoped worker resolution without capturing a scoped service.
webApp.MapGet("/api/enrollments/worker-smoke", (EnrollmentWorker worker) =>
{
	worker.ProcessBatch();
	return Results.Ok("processed");
});

// Exercise 6: Return a consistent ProblemDetails response for intentional failures.
webApp.MapGet("/api/error", () =>
{
	throw new TmsDatabaseException(
		"ProblemDetailsTest",
		"Simulated database failure for ProblemDetails testing");
});

// Exercise 7: Expose API discovery only in Development.
if (webApp.Environment.IsDevelopment())
{
	webApp.MapOpenApi("v1");
	webApp.MapOpenApi("v2");
	webApp.MapScalarApiReference(options => options
		.WithTitle("TMS API Reference")
		.AddDocument("v1", "API Version 1.0")
		.AddDocument("v2", "API Version 2.0"));
}

// Exercise 5: Map controller-based CRUD endpoints after authentication and authorization.
webApp.MapControllers();

// Module 5 Exercise 2: Apply migrations and seed data only when explicitly enabled.
if (Environment.GetEnvironmentVariable("TMS_AUTO_MIGRATE") == "true")
{
	using IServiceScope databaseScope = webApp.Services.CreateScope();
	TmsDbContext database = databaseScope.ServiceProvider.GetRequiredService<TmsDbContext>();
	database.Database.Migrate();

	// Exercise 2 test setup: insert deterministic rows for LINQ and SQL experiments.
	if (!database.Students.Any())
	{
		DbStudent[] seededStudents =
		[
			new() { RegistrationNumber = "TMS-2026-0001", Name = "Alice Smith", GPA = 3.8m },
			new() { RegistrationNumber = "TMS-2026-0002", Name = "Bob Jones", GPA = 2.9m },
			new() { RegistrationNumber = "TMS-2026-0003", Name = "Charlie Brown", GPA = 3.4m, IsActive = false },
			new() { RegistrationNumber = "TMS-2026-0004", Name = "Diana Prince", GPA = 3.9m },
			new() { RegistrationNumber = "TMS-2026-0005", Name = "Evan Wright", GPA = 2.5m }
		];
		DbCourse[] seededCourses =
		[
			new() { Code = "CS-101", Title = "Introduction to Computer Science", MaxCapacity = 30 },
			new() { Code = "CS-201", Title = "Data Structures and Algorithms", MaxCapacity = 25 },
			new() { Code = "MAT-101", Title = "Calculus I", MaxCapacity = 40 }
		];
		database.Students.AddRange(seededStudents);
		database.Courses.AddRange(seededCourses);
		database.SaveChanges();
		database.Enrollments.AddRange(
			new DbEnrollment { StudentId = seededStudents[0].Id, CourseId = seededCourses[0].Id, Grade = 4.0m },
			new DbEnrollment { StudentId = seededStudents[0].Id, CourseId = seededCourses[1].Id, Grade = 3.6m },
			new DbEnrollment { StudentId = seededStudents[1].Id, CourseId = seededCourses[0].Id, Grade = 2.8m },
			new DbEnrollment { StudentId = seededStudents[3].Id, CourseId = seededCourses[1].Id, Grade = 3.9m });
		database.SaveChanges();
	}
}

// Module 6 Exercise 4 setup: Seed the deterministic course catalogue only in Development.
if (webApp.Environment.IsDevelopment())
{
	// Question 1: Create a scope because TmsDbContext is registered as scoped.
	using IServiceScope seederScope = webApp.Services.CreateScope();
	// Question 2: Resolve the scoped context from the temporary scope.
	TmsDbContext seederContext = seederScope.ServiceProvider.GetRequiredService<TmsDbContext>();
	// Question 3: Apply migrations and insert the 25 courses idempotently.
	await DataSeeder.SeedAsync(seederContext);
}

await webApp.RunAsync();

public partial class Program { }


