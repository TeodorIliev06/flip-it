namespace FlipIt.Server.Services;

public interface IPasswordHasher
{
    (string hashBase64, string saltBase64) HashPassword(string password);
    bool VerifyPassword(string password, string hashBase64, string saltBase64);
}
