namespace FlipIt.Server.DTOs;

using System.Text.Json.Serialization;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record GoogleAuthRequest(string IdToken);

public record GitHubAuthRequest(string Code);
public record GitHubAccessTokenResponse(
    [property: JsonPropertyName("access_token")] string? AccessToken,
    [property: JsonPropertyName("scope")] string? Scope,
    [property: JsonPropertyName("token_type")] string? TokenType,
    [property: JsonPropertyName("error")] string? Error,
    [property: JsonPropertyName("error_description")] string? ErrorDescription
);
public record GitHubUserInfo(
    [property: JsonPropertyName("id")] long Id,  // GitHub returns id as number
    [property: JsonPropertyName("login")] string Login,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("avatar_url")] string AvatarUrl
);

public record GitHubEmail(
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("primary")] bool Primary,
    [property: JsonPropertyName("verified")] bool Verified
);

public record AuthResponse(
    int UserId,
    string Email,
    string AccessToken,
    DateTime ExpiryTime
);
