using Microsoft.Extensions.DependencyInjection;
using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Services;

// Module 4 Exercise 2: Resolve scoped work inside a short-lived scope.
public sealed class EnrollmentWorker(IServiceScopeFactory scopeFactory)
{
	public void ProcessBatch()
	{
		using IServiceScope scope = scopeFactory.CreateScope();
		IEnrollmentService service = scope.ServiceProvider
			.GetRequiredService<IEnrollmentService>();

		service.GetAllAsync().GetAwaiter().GetResult();
	}
}

