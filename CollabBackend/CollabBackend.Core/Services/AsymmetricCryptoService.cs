using CollabBackend.Core.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace CollabBackend.Core.Services;

public class AsymmetricCryptoService : IAsymmetricCryptoService
{
    public (string PublicKey, string PrivateKey) GenerateKeyPair()
    {
        using var rsa = RSA.Create(2048);
        return (
            Convert.ToBase64String(rsa.ExportRSAPublicKey()),
            Convert.ToBase64String(rsa.ExportRSAPrivateKey())
        );
    }

    public string EncryptWithPublicKey(string data, string publicKey)
    {
        using var rsa = RSA.Create();
        rsa.ImportRSAPublicKey(Convert.FromBase64String(publicKey), out _);
        
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var encryptedBytes = rsa.Encrypt(dataBytes, RSAEncryptionPadding.OaepSHA256);
        return Convert.ToBase64String(encryptedBytes);
    }

    public string DecryptWithPrivateKey(string encryptedData, string privateKey)
    {
        using var rsa = RSA.Create();
        rsa.ImportRSAPrivateKey(Convert.FromBase64String(privateKey), out _);
        
        var encryptedBytes = Convert.FromBase64String(encryptedData);
        var decryptedBytes = rsa.Decrypt(encryptedBytes, RSAEncryptionPadding.OaepSHA256);
        return Encoding.UTF8.GetString(decryptedBytes);
    }
} 