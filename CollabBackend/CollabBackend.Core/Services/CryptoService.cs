using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

namespace CollabBackend.Core.Services;

public class CryptoService
{
    private readonly string _key;
    private readonly int _iterations = 10000;
    
    public CryptoService(IConfiguration configuration)
    {
        _key = configuration["Crypto:Key"] ?? throw new InvalidOperationException("Encryption key not configured");
    }

    public string EncryptSensitiveData(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;

        using var aes = Aes.Create();
        aes.GenerateIV();

        // Generate key using PBKDF2
        var salt = RandomNumberGenerator.GetBytes(16);
        var keyBytes = new Rfc2898DeriveBytes(_key, salt, _iterations, HashAlgorithmName.SHA256);
        aes.Key = keyBytes.GetBytes(32); // 256 bits

        using var encryptor = aes.CreateEncryptor();
        using var msEncrypt = new MemoryStream();
        
        // Write salt and IV to output
        msEncrypt.Write(salt, 0, salt.Length);
        msEncrypt.Write(aes.IV, 0, aes.IV.Length);

        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        using (var swEncrypt = new StreamWriter(csEncrypt))
        {
            swEncrypt.Write(plainText);
        }

        return Convert.ToBase64String(msEncrypt.ToArray());
    }

    public string DecryptSensitiveData(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;

        try
        {
            var fullCipher = Convert.FromBase64String(cipherText);
            
            using var aes = Aes.Create();
            
            // Extract salt and IV
            var salt = new byte[16];
            var iv = new byte[16];
            Array.Copy(fullCipher, 0, salt, 0, 16);
            Array.Copy(fullCipher, 16, iv, 0, 16);

            // Derive key using PBKDF2
            var keyBytes = new Rfc2898DeriveBytes(_key, salt, _iterations, HashAlgorithmName.SHA256);
            aes.Key = keyBytes.GetBytes(32);
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor();
            using var msDecrypt = new MemoryStream(fullCipher, 32, fullCipher.Length - 32);
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);
            
            return srDecrypt.ReadToEnd();
        }
        catch
        {
            // If decryption fails (e.g., for existing unencrypted messages), return the original text
            return cipherText;
        }
    }

    public string HashSensitiveData(string data)
    {
        using var sha256 = SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(data);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
} 