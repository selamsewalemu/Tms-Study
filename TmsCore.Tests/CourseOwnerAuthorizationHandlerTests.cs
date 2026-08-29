using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TmsCore.Api.Authorization;
using Xunit;

namespace TmsCore.Tests;

public class CourseOwnerAuthorizationHandlerTests
{
    [Fact]
    public async Task Succeeds_When_User_Is_The_Resource_Owner()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "owner-42")
        ], "TestAuthType"));

        var context = new AuthorizationHandlerContext(
            [new CourseOwnerRequirement()],
            user,
            new CourseResource(7, "owner-42"));

        var handler = new CourseOwnerAuthorizationHandler();
        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task Fails_When_User_Is_Not_The_Resource_Owner()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "owner-99")
        ], "TestAuthType"));

        var context = new AuthorizationHandlerContext(
            [new CourseOwnerRequirement()],
            user,
            new CourseResource(7, "owner-42"));

        var handler = new CourseOwnerAuthorizationHandler();
        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }
}
