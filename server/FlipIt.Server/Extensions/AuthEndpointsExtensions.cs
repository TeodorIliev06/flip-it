using System.Security.Claims;

using FlipIt.Server.DTOs;
using FlipIt.Server.Services.Auth;

namespace FlipIt.Server.Extensions;

public static class AuthEndpointsExtensions
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/auth").WithTags("Auth");

        auth.MapPost("/register",
            async (RegisterRequest request, IAuthService authService, HttpContext ctx) =>
                await authService.RegisterAsync(request)
        );

        auth.MapPost("/login",
            async (LoginRequest request, IAuthService authService, HttpResponse http) =>
                await authService.LoginAsync(request, http)
        );

        auth.MapPost("/refresh", async (HttpRequest http, IAuthService authService) =>
            await authService.RefreshAsync(http)
        );

        auth.MapPost("/google", async (GoogleAuthRequest request, IAuthService authService, HttpResponse http, IConfiguration config) =>
            await authService.GoogleAuthAsync(request, http, config)
        );

        auth.MapPost("/github", async (GitHubAuthRequest request, IAuthService authService, HttpResponse http, IConfiguration config) =>
            await authService.GitHubAuthAsync(request, http, config)
        );

        auth.MapPost("/logout", async (HttpResponse http, IAuthService authService, ClaimsPrincipal userPrincipal) =>
            await authService.LogoutAsync(http, userPrincipal)
        );

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
