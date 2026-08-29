using System.Threading.Channels;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TmsCore.Application.Transcripts;
using TmsCore.Infrastructure.Transcripts;

namespace TmsCore.Api.Controllers.V2;

[ApiController]
[Route("api/v{version:apiVersion}/transcripts")]
[ApiVersion("2.0")]
public sealed class TranscriptsController(
    Channel<TranscriptRequest> channel,
    ITranscriptStatusStore statusStore) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("transcripts")]
    public async Task<IActionResult> RequestTranscript(
        [FromBody] TranscriptRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var existingReportId = await statusStore.GetReportIdForIdempotencyKeyAsync(idempotencyKey, ct);
            if (existingReportId is not null)
            {
                var existingStatus = await statusStore.GetAsync(existingReportId, ct);
                if (existingStatus is not null)
                {
                    return AcceptedAtAction(nameof(GetStatus), new { id = existingReportId }, existingStatus);
                }
            }
        }

        var reportId = Guid.NewGuid().ToString("N")[..12];
        var status = await statusStore.CreateAsync(reportId, request.StudentId, ct);

        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            await statusStore.LinkIdempotencyKeyAsync(idempotencyKey, reportId, ct);
        }

        await channel.Writer.WriteAsync(request.WithReportId(reportId), ct);
        Response.Headers.RetryAfter = "5";
        return AcceptedAtAction(nameof(GetStatus), new { id = reportId }, status);
    }

    [HttpGet("{id}/status")]
    public async Task<IActionResult> GetStatus(string id, CancellationToken ct)
    {
        var status = await statusStore.GetAsync(id, ct);
        return status is null
            ? NotFound(new ProblemDetails
            {
                Title = "Transcript not found",
                Detail = $"No transcript request with id '{id}'.",
                Status = StatusCodes.Status404NotFound,
            })
            : Ok(status);
    }
}
