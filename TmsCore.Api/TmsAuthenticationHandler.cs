using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace TmsCore;

// Module 4 Exercise 1: Minimal authentication scheme for the protected route.
// It leaves callers unauthenticated until a real TMS identity provider is added.
public sealed class TmsAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
	public TmsAuthenticationHandler(
		IOptionsMonitor<AuthenticationSchemeOptions> options,
		ILoggerFactory logger,
		UrlEncoder encoder)
		: base(options, logger, encoder)
	{
	}

	protected override Task<AuthenticateResult> HandleAuthenticateAsync()
	{
		return Task.FromResult(AuthenticateResult.NoResult());
	}
}
