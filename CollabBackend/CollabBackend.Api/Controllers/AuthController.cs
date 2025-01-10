using Microsoft.AspNetCore.Mvc;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using CollabBackend.Core.Services;

namespace CollabBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ISecurityLoggingService _securityLoggingService;

    public AuthController(IAuthService authService, ISecurityLoggingService securityLoggingService)
    {
        _authService = authService;
        _securityLoggingService = securityLoggingService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        try
        {
            if (!ValidationService.IsValidEmail(request.Email))
            return BadRequest(new { message = "Invalid email format" });    
            
            var (user, token) = await _authService.LoginAsync(request.Email, request.Password);
            _securityLoggingService.LogLoginAttempt(request.Email, true, ipAddress);
            
            var userDto = new UserDto(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role,
                user.CreatedAt,
                user.UpdatedAt
            );
            return Ok(new AuthResponseDto(userDto, token));
        }
        catch (UnauthorizedAccessException)
        {
            _securityLoggingService.LogLoginAttempt(request.Email, false, ipAddress);
            return Unauthorized(new { message = "Invalid email or password" });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Validate inputs
            if (!ValidationService.IsValidEmail(request.Email))
                return BadRequest(new { message = "Invalid email format" });

            if (!ValidationService.IsValidName(request.FirstName))
                return BadRequest(new { message = "Invalid first name format" });

            if (!ValidationService.IsValidName(request.LastName))
                return BadRequest(new { message = "Invalid last name format" });

            // Sanitize inputs
            var sanitizedFirstName = ValidationService.SanitizeInput(request.FirstName);
            var sanitizedLastName = ValidationService.SanitizeInput(request.LastName);
            var sanitizedEmail = request.Email.ToLowerInvariant().Trim();

            var (user, token) = await _authService.RegisterAsync(
                sanitizedEmail, 
                request.Password, 
                sanitizedFirstName, 
                sanitizedLastName
            );

            _securityLoggingService.LogSecurityEvent(
                "Registration", 
                $"New user registered with email {sanitizedEmail}", 
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                LogLevel.Information
            );

            return Ok(new AuthResponseDto(
                new UserDto(user.Id, user.Email, user.FirstName, user.LastName, 
                           user.Role, user.CreatedAt, user.UpdatedAt),
                token
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FirstName, string LastName); 