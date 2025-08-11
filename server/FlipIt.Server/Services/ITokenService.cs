using FlipIt.Server.Models;

namespace FlipIt.Server.Services;

public interface ITokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(User user);
    (string token, DateTime expiresAt) CreateRefreshToken();
}


