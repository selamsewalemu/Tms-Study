using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TmsCore.ExceptionHandlers;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
	public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct)
	{
		(int status, string title, string detail, IDictionary<string, string[]>? errors) = exception switch
		{
			ValidationException validationException => (
				StatusCodes.Status400BadRequest,
				"Validation failed",
				"One or more fields are invalid. See errors for details.",
				validationException.Errors
					.GroupBy(error => error.PropertyName)
					.ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())),
			_ => (
				StatusCodes.Status500InternalServerError,
				"Server error",
				$"An unexpected error occurred. Trace ID: {httpContext.TraceIdentifier}",
				null)
		};

		if (status == StatusCodes.Status500InternalServerError)
		{
			logger.LogError(exception, "Unhandled exception (trace={TraceId})", httpContext.TraceIdentifier);
		}

		ProblemDetails problem = new()
		{
			Status = status,
			Title = title,
			Detail = detail,
			Instance = httpContext.Request.Path
		};
		if (errors is not null)
		{
			problem.Extensions["errors"] = errors;
		}
		problem.Extensions["traceId"] = httpContext.TraceIdentifier;
		httpContext.Response.StatusCode = status;
		httpContext.Response.ContentType = "application/problem+json";
		await httpContext.Response.WriteAsJsonAsync(problem, ct);
		return true;
	}
}

