using System.Security.Claims;

using FlipIt.Server.DTOs;

namespace FlipIt.Server.Services.Auth;

public interface IAuthService
{
    Task<IResult> RegisterAsync(RegisterRequest request);
    Task<IResult> LoginAsync(LoginRequest request, HttpResponse http);
    Task<IResult> RefreshAsync(HttpRequest http);
    Task<IResult> GoogleAuthAsync(GoogleAuthRequest request, HttpResponse http, IConfiguration config);
    Task<IResult> GitHubAuthAsync(GitHubAuthRequest request, HttpResponse http, IConfiguration config);
    Task<IResult> LogoutAsync(HttpResponse http, ClaimsPrincipal userPrincipal);
}
