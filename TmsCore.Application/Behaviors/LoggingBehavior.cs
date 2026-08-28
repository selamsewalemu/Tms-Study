using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace TmsCore.Application.Behaviors;

public sealed class LoggingBehavior<TRequest, TResponse>(
	ILogger<LoggingBehavior<TRequest, TResponse>> logger)
	: IPipelineBehavior<TRequest, TResponse>
	where TRequest : notnull
{
	public async Task<TResponse> Handle(
		TRequest request,
		RequestHandlerDelegate<TResponse> next,
		CancellationToken ct)
	{
		string requestName = typeof(TRequest).Name;
		string correlationId = Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");
		Stopwatch stopwatch = Stopwatch.StartNew();
		using IDisposable? scope = logger.BeginScope(new Dictionary<string, object>
		{
			["RequestName"] = requestName,
			["CorrelationId"] = correlationId
		});
		logger.LogInformation("Handling {RequestName} (cid={CorrelationId})", requestName, correlationId);
		try
		{
			TResponse response = await next();
			stopwatch.Stop();
			logger.LogInformation("Handled {RequestName} in {ElapsedMs}ms (cid={CorrelationId})", requestName, stopwatch.ElapsedMilliseconds, correlationId);
			return response;
		}
		catch (Exception exception)
		{
			stopwatch.Stop();
			logger.LogError(exception, "Failed {RequestName} after {ElapsedMs}ms (cid={CorrelationId})", requestName, stopwatch.ElapsedMilliseconds, correlationId);
			throw;
		}
	}
}

