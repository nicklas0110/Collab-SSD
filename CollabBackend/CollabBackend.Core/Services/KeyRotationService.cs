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