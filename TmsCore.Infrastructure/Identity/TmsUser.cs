using Microsoft.AspNetCore.Identity;

namespace TmsCore.Infrastructure.Identity;

public sealed class TmsUser : IdentityUser
{
    public string? DisplayName { get; set; }
    public string? FirstName { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
