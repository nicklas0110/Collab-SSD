using Microsoft.AspNetCore.Mvc;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;

namespace CollabBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var (user, token) = await _authService.LoginAsync(request.Email, request.Password);
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
            return Unauthorized(new { message = "Invalid email or password" });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var (user, token) = await _authService.RegisterAsync(
                request.Email, 
                request.Password,
                request.FirstName,
                request.LastName
            );
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FirstName, string LastName); 