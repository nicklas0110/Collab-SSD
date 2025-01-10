using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

public class KeyRotationService
{
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, string> _keyVersions = new();
    
    public KeyRotationService(IConfiguration configuration)
    {
        _configuration = configuration;
        LoadKeys();
    }

    private void LoadKeys()
    {
        var currentKey = _configuration["Crypto:CurrentKey"];
        var oldKey1 = _configuration["Crypto:OldKey1"];
        var oldKey2 = _configuration["Crypto:OldKey2"];

        if (currentKey != null) _keyVersions["current"] = currentKey;
        if (oldKey1 != null) _keyVersions["old1"] = oldKey1;
        if (oldKey2 != null) _keyVersions["old2"] = oldKey2;
    }

    public string GetCurrentKey() => _keyVersions["current"];

    public bool TryDecryptWithAllKeys(string encryptedData, out string decryptedData)
    {
        decryptedData = string.Empty;
        foreach (var key in _keyVersions.Values)
        {
            try
            {
                using var aes = Aes.Create();
                var salt = new byte[16];
                var iv = new byte[16];
                var fullCipher = Convert.FromBase64String(encryptedData);
                
                Array.Copy(fullCipher, 0, salt, 0, 16);
                Array.Copy(fullCipher, 16, iv, 0, 16);

                var keyBytes = new Rfc2898DeriveBytes(key, salt, 10000, HashAlgorithmName.SHA256);
                aes.Key = keyBytes.GetBytes(32);
                aes.IV = iv;

                using var decryptor = aes.CreateDecryptor();
                using var msDecrypt = new MemoryStream(fullCipher, 32, fullCipher.Length - 32);
                using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                using var srDecrypt = new StreamReader(csDecrypt);
                
                decryptedData = srDecrypt.ReadToEnd();
                return true;
            }
            catch
            {
                continue;
            }
        }
        return false;
    }

    public async Task RotateKeysAsync()
    {
        // Generate a new key
        var newKey = GenerateNewKey();
        
        // Shift existing keys
        if (_keyVersions.ContainsKey("old2"))
            _keyVersions.Remove("old2");
        
        if (_keyVersions.ContainsKey("old1"))
            _keyVersions["old2"] = _keyVersions["old1"];
        
        if (_keyVersions.ContainsKey("current"))
            _keyVersions["old1"] = _keyVersions["current"];
        
        _keyVersions["current"] = newKey;

        // In a real application, you would:
        // 1. Save the new keys to a secure storage
        // 2. Re-encrypt sensitive data with the new key
        // 3. Update configuration or key vault
        
        await Task.CompletedTask; // Placeholder for actual async operations
    }

    private string GenerateNewKey()
    {
        var keyBytes = new byte[32]; // 256 bits
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(keyBytes);
        return Convert.ToBase64String(keyBytes);
    }
} 