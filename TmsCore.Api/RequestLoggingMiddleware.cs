using System.Diagnostics;

namespace TmsCore;

// Module 4 Exercise 1B: Correlate each request with its response and log timing.
public sealed class RequestLoggingMiddleware
{
	private readonly RequestDelegate _next;
	private readonly ILogger<RequestLoggingMiddleware> _logger;

	public RequestLoggingMiddleware(
		RequestDelegate next,
		ILogger<RequestLoggingMiddleware> logger)
	{
		_next = next;
		_logger = logger;
	}

	public async Task InvokeAsync(HttpContext context)
	{
		string correlationId = Guid.NewGuid().ToString("N")[..8];
		Stopwatch stopwatch = Stopwatch.StartNew();
		context.Response.Headers["X-Correlation-Id"] = correlationId;

		_logger.LogInformation(
			"Request started: {Method} {Path} CorrelationId={CorrelationId}",
			context.Request.Method,
			context.Request.Path,
			correlationId);

		try
		{
			await _next(context);
		}
		finally
		{
			stopwatch.Stop();
			_logger.LogInformation(
				"Request finished: StatusCode={StatusCode} ElapsedMs={ElapsedMs} CorrelationId={CorrelationId}",
				context.Response.StatusCode,
				stopwatch.ElapsedMilliseconds,
				correlationId);
		}
	}
}
