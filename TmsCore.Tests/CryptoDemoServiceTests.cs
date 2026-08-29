using Xunit;
using TmsCore.Infrastructure.Identity;

namespace TmsCore.Tests;

public class CryptoDemoServiceTests
{
    [Fact]
    public void HashPassword_ShouldProduceDifferentHashAndVerify()
    {
        var service = new CryptoDemoService();
        const string password = "Password123!";

        string hash = service.HashPassword(password);

        Assert.NotEqual(password, hash);
        Assert.Contains("$2a$", hash);
        Assert.True(service.VerifyPassword(password, hash));
        Assert.False(service.VerifyPassword("WrongPassword!", hash));
    }
}
