namespace FlipIt.Server.DTOs;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);

public record AuthResponse(
    int UserId,
    string Email,
    string AccessToken,
    DateTime ExpiryTime
);
