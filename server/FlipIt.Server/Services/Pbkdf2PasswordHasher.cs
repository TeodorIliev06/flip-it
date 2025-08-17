using System.Security.Cryptography;

namespace FlipIt.Server.Services;

public class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int SaltSizeBytes = 16; // 128-bit salt
    private const int HashSizeBytes = 32; // 256-bit hash
    private const int Iterations = 150_000;

    public (string hashBase64, string saltBase64) HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSizeBytes);

        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    public bool VerifyPassword(string password, string hashBase64, string saltBase64)
    {
        var salt = Convert.FromBase64String(saltBase64);
        var expectedHash = Convert.FromBase64String(hashBase64);

        var computed = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(expectedHash, computed);
    }
}
