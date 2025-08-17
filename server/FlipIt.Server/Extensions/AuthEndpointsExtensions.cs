using System.Security.Claims;

using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;
using FlipIt.Server.Options;
using FlipIt.Server.Services;

namespace FlipIt.Server.Extensions;

public static class AuthEndpointsExtensions
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/auth").WithTags("Auth");

        auth.MapPost("/register",
            async (RegisterRequest request, FlipItDbContext db, IPasswordHasher passwordHasher) =>
            {
                var email = request.Email.Trim().ToLowerInvariant();

                if (await db.Users.AnyAsync(u => u.Email == email))
                {
                    return Results.Conflict("Email already registered");
                }

                var (hash, salt) = passwordHasher.HashPassword(request.Password);
                var user = new User
                {
                    Username = request.Username,
                    Email = email,
                    PasswordSalt = salt,
                    PasswordHash = hash
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Created($"/users/{user.Id}", new { user.Id, user.Email });
            });

        auth.MapPost("/login", async (LoginRequest request, FlipItDbContext db, HttpResponse http, ITokenService tokenService, IOptions<JwtOptions> jwtOptions, IPasswordHasher passwordHasher) =>
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            if (!passwordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return Results.Unauthorized();
            }

            var (accessToken, expiryTime) = tokenService.CreateAccessToken(user);
            var (refreshToken, refreshExpiryTime) = tokenService.CreateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = refreshExpiryTime;

            await db.SaveChangesAsync();
            var response = new LoginResponse(user.Id, user.Email, user.Username, accessToken, expiryTime);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = jwtOptions.Value.CookieSecure,
                SameSite = SameSiteMode.None,
                Expires = user.RefreshTokenExpiresAt
            };

            http.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            return Results.Ok(response);
        });

        auth.MapPost("/refresh", async (HttpRequest http, FlipItDbContext db, ITokenService tokenService) =>
        {
            if (!http.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                return Results.Unauthorized();
            }

            var user = await db.Users
                .FirstOrDefaultAsync(u =>
                    u.RefreshToken == refreshToken &&
                    u.RefreshTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var (accessToken, expiryTime) = tokenService.CreateAccessToken(user);

            return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, expiryTime));
        });

        auth.MapPost("/google", async (
            GoogleAuthRequest request,
            FlipItDbContext db,
            ITokenService tokenService,
            IOptions<JwtOptions> jwtOptions,
            HttpResponse http,
            IConfiguration config) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.IdToken))
                {
                    return Results.BadRequest("Missing idToken");
                }

                var clientId = config.GetValue<string>("Google:ClientId");

                if (string.IsNullOrWhiteSpace(clientId))
                {
                    return Results.Problem("Server Google ClientId is not configured");
                }

                GoogleJsonWebSignature.Payload payload;
                try
                {
                    payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    });
                }
                catch (Exception ex)
                {
                    return Results.Unauthorized();
                }

                var email = (payload.Email ?? string.Empty)
                .Trim()
                .ToLowerInvariant();

                if (string.IsNullOrEmpty(email))
                {
                    return Results.Unauthorized();
                }
                var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        PasswordHash = string.Empty,
                        PasswordSalt = string.Empty
                    };
                    db.Users.Add(user);
                    await db.SaveChangesAsync();
                }
                var (accessToken, accessExpires) = tokenService.CreateAccessToken(user);
                var (refreshToken, refreshExpires) = tokenService.CreateRefreshToken();
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiresAt = refreshExpires;
                await db.SaveChangesAsync();
                http.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = jwtOptions.Value.CookieSecure,
                    SameSite = SameSiteMode.None,
                    Expires = refreshExpires
                });
                return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, accessExpires));
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                throw;
            }
        });

        auth.MapPost("/github", async (
            GitHubAuthRequest request,
            FlipItDbContext db,
            ITokenService tokenService,
            IOptions<JwtOptions> jwtOptions,
            HttpResponse http,
            IConfiguration config,
            HttpContext context) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Code))
                {
                    return Results.BadRequest("Missing authorization code");
                }

                var clientId = config.GetValue<string>("GitHub:ClientId");
                var clientSecret = config.GetValue<string>("GitHub:ClientSecret");
                var redirectUri = config.GetValue<string>("GitHub:RedirectUri");

                if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
                {
                    return Results.Problem("GitHub OAuth not configured");
                }

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                httpClient.DefaultRequestHeaders.Add("User-Agent", "FlipIt-App");

                var formData = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("client_id", clientId),
                    new KeyValuePair<string, string>("client_secret", clientSecret),
                    new KeyValuePair<string, string>("code", request.Code),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri!)
                });

                var tokenResponse = await httpClient
                    .PostAsync("https://github.com/login/oauth/access_token", formData);

                if (!tokenResponse.IsSuccessStatusCode)
                {
                    return Results.Problem("Failed to get access token from GitHub");
                }

                var tokenData = await tokenResponse.Content
                    .ReadFromJsonAsync<GitHubAccessTokenResponse>();

                if (tokenData?.AccessToken == null)
                {
                    return Results.Problem($"GitHub OAuth failed: {tokenData?.Error ?? "Unknown error"}");
                }

                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.AccessToken);
                var userResponse = await httpClient.GetAsync("https://api.github.com/user");

                if (!userResponse.IsSuccessStatusCode)
                {
                    return Results.Problem("Failed to get user info from GitHub");
                }

                var userInfo = await userResponse.Content.ReadFromJsonAsync<GitHubUserInfo>();
                string? githubEmail = userInfo?.Email;

                if (string.IsNullOrEmpty(githubEmail))
                {
                    var emailsResponse = await httpClient.GetAsync("https://api.github.com/user/emails");

                    if (emailsResponse.IsSuccessStatusCode)
                    {
                        var emails = await emailsResponse.Content.ReadFromJsonAsync<GitHubEmail[]>();
                        githubEmail = emails?.FirstOrDefault(e => e.Primary)?.Email;
                    }
                }
                if (string.IsNullOrEmpty(githubEmail))
                {
                    return Results.Problem("No email found in GitHub user info. GitHub users can have private emails.");
                }

                var email = githubEmail.Trim().ToLowerInvariant();
                var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        PasswordHash = string.Empty,
                        PasswordSalt = string.Empty
                    };

                    db.Users.Add(user);
                    await db.SaveChangesAsync();
                }

                var (accessToken, accessExpires) = tokenService.CreateAccessToken(user);
                var (refreshToken, refreshExpires) = tokenService.CreateRefreshToken();
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiresAt = refreshExpires;

                await db.SaveChangesAsync();

                http.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = jwtOptions.Value.CookieSecure,
                    SameSite = SameSiteMode.None,
                    Expires = refreshExpires
                });

                return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, accessExpires));
            }
            catch (Exception e)
            {
                Console.WriteLine($"GitHub auth error: {e}");
                throw;
            }
        });

        auth.MapPost("/logout", async (HttpResponse http, FlipItDbContext db, ClaimsPrincipal userPrincipal) =>
        {
            var userIdStr = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(userIdStr, out var userId))
            {
                var user = await db.Users.FindAsync(userId);

                if (user != null)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpiresAt = null;
                    await db.SaveChangesAsync();
                }
            }

            http.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Results.Ok();
        });

        //auth.MapGet("/me", (ClaimsPrincipal user) =>
        //{
        //    if (user.Identity?.IsAuthenticated == true)
        //    {
        //        return Results.Ok(new
        //        {
        //            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier),
        //            Email = user.FindFirstValue(ClaimTypes.Email)
        //        });
        //    }
        //    return Results.Unauthorized();
        //}).RequireAuthorization();

        return app;
    }
}
