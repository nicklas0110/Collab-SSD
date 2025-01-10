using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CollabBackend.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IAsymmetricCryptoService _asymmetricService;

    public AuthService(IUserRepository userRepository, IConfiguration configuration, IAsymmetricCryptoService asymmetricService)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _asymmetricService = asymmetricService;
    }

    public async Task<(User user, string token)> LoginAsync(string email, string password)
    {
        email = email.ToLowerInvariant().Trim();
        
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var token = GenerateJwtToken(user);
        return (user, token);
    }

    public async Task<(User user, string token)> RegisterAsync(string email, string password, string firstName, string lastName)
    {
        email = email.ToLowerInvariant().Trim();

        if (!await ValidatePasswordAsync(password))
        {
            throw new ArgumentException("Password does not meet requirements");
        }

        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Generate key pair for the new user
        var (publicKey, privateKey) = _asymmetricService.GenerateKeyPair();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            Role = "user",
            PublicKey = publicKey,
            PrivateKey = privateKey,  // In production, this should be encrypted before storage
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);
        var token = GenerateJwtToken(user);
        return (user, token);
    }

    public Task<bool> ValidatePasswordAsync(string password)
    {
        var hasNumber = new Regex(@"[0-9]+");
        var hasUpperChar = new Regex(@"[A-Z]+");
        var hasLowerChar = new Regex(@"[a-z]+");
        var hasSymbols = new Regex(@"[!@#$%^&*()_+=\[{\]};:<>|./?,-]");
        var hasMinLength = password.Length >= 8;

        return Task.FromResult(
            hasNumber.IsMatch(password) &&
            hasUpperChar.IsMatch(password) &&
            hasLowerChar.IsMatch(password) &&
            hasSymbols.IsMatch(password) &&
            hasMinLength
        );
    }

    private string GenerateJwtToken(User user)
    {
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found"));
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
} 