using System.Threading.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TmsCore.Application.Notifications;
using TmsCore.Application.Transcripts;
using TmsCore.Infrastructure.Transcripts;

namespace TmsCore.Infrastructure.Workers;

public class TranscriptWorker(
    Channel<TranscriptRequest> channel,
    IServiceScopeFactory scopeFactory,
    ITranscriptStatusStore statusStore,
    ITranscriptNotificationService notificationService,
    ILogger<TranscriptWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        logger.LogInformation("Transcript worker started.");

        await foreach (var request in channel.Reader.ReadAllAsync(ct))
        {
            var reportId = request.ReportId ?? throw new InvalidOperationException("ReportId must be set before queueing.");

            try
            {
                await statusStore.MarkProcessingAsync(reportId, ct);
                logger.LogInformation("Generating transcript {ReportId} for student {StudentId}", reportId, request.StudentId);

                using var scope = scopeFactory.CreateScope();
                await Task.Delay(TimeSpan.FromSeconds(5), ct);

                var downloadUrl = $"/api/v2/transcripts/{reportId}/download";
                await statusStore.MarkReadyAsync(reportId, downloadUrl, ct);
                await notificationService.NotifyTranscriptReadyAsync(request.StudentId, reportId, downloadUrl);

                logger.LogInformation("Transcript ready: {ReportId}", reportId);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                logger.LogWarning("Worker shutdown transcript {ReportId} did not complete", reportId);
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to generate transcript {ReportId}", reportId);
                await statusStore.MarkFailedAsync(reportId, ex.Message, CancellationToken.None);
            }
        }
    }
}
