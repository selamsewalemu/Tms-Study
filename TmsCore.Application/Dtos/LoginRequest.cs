namespace TmsCore.Application.Dtos;

public record LoginRequest(string Username, string Password, string? Email = null);

public record RegisterRequest(string Username, string Email, string Password, string? DisplayName = null);
