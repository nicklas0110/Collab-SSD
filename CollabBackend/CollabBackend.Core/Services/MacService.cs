using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;

public class MacService
{
    private readonly string _key;

    public MacService(IConfiguration configuration)
    {
        _key = configuration["Crypto:MacKey"] ?? throw new InvalidOperationException("MAC key not configured");
    }

    public string GenerateMAC(string message)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }

    public bool VerifyMAC(string message, string expectedMac)
    {
        var computedMac = GenerateMAC(message);
        return computedMac == expectedMac;
    }
} 