using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace TmsCore.Api.Authorization;

public sealed record CourseResource(int CourseId, string OwnerUserId);

public sealed class CourseOwnerRequirement : IAuthorizationRequirement
{
}

public sealed class CourseOwnerAuthorizationHandler : AuthorizationHandler<CourseOwnerRequirement, CourseResource>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        CourseOwnerRequirement requirement,
        CourseResource resource)
    {
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        string? userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(userId) && userId == resource.OwnerUserId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
