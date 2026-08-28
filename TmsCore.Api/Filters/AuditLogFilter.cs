using Microsoft.AspNetCore.Mvc.Filters;

namespace TmsCore.Filters;

// Module 6 Exercise 4 Part D: Log controller calls as a cross-cutting concern.
public sealed class AuditLogFilter(ILogger<AuditLogFilter> logger) : IActionFilter
{
	// Question 1: Log the route and method before the action runs.
	public void OnActionExecuting(ActionExecutingContext context)
	{
		logger.LogInformation(
			"TMS API call: {Method} {Route}",
			context.HttpContext.Request.Method,
			context.HttpContext.Request.Path);
	}

	// Question 2: Log the response status after the action finishes.
	public void OnActionExecuted(ActionExecutedContext context)
	{
		logger.LogInformation(
			"TMS API response: {StatusCode}",
			context.HttpContext.Response.StatusCode);
	}
}
