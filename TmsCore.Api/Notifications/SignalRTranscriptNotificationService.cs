using Microsoft.AspNetCore.SignalR;
using TmsCore.Api.Hubs;
using TmsCore.Application.Hubs;
using TmsCore.Application.Notifications;

namespace TmsCore.Api.Notifications;

public class SignalRTranscriptNotificationService(IHubContext<TmsHub, ITmsHubClient> hubContext)
    : ITranscriptNotificationService
{
    public async Task NotifyTranscriptReadyAsync(int studentId, string reportId, string downloadUrl)
    {
        await hubContext.Clients
            .Group(GroupNames.Student(studentId.ToString()))
            .ReceiveTranscriptReady(reportId, downloadUrl);
    }
}
