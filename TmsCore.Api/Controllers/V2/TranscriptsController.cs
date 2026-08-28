using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace TmsCore.Api.Controllers.V2;

[ApiController]
[Route("api/v{version:apiVersion}/transcripts")]
[ApiVersion("2.0")]
public sealed class TranscriptsController : ControllerBase
{
	[HttpPost]
	[EnableRateLimiting("transcripts")]
	public IActionResult RequestTranscript([FromBody] object? request)
	{
		return Ok();
	}
}
