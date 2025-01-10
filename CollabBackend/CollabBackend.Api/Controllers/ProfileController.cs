using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using CollabBackend.Core.Services;

namespace CollabBackend.Api.Controllers;

[Authorize]
[ApiController]
[ApiVersion("1.0")]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly IUserService _userService;
    private readonly ISecurityLoggingService _securityLoggingService;

    public ProfileController(IProfileService profileService, IUserService userService, ISecurityLoggingService securityLoggingService)
    {
        _profileService = profileService;
        _userService = userService;
        _securityLoggingService = securityLoggingService;
    }

    [HttpGet]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = _userService.GetCurrentUserId();
        var user = await _profileService.GetProfileAsync(userId);
        
        if (user == null)
            return NotFound();

        var dto = new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.CreatedAt,
            user.UpdatedAt
        );
        
        return Ok(dto);
    }

    [HttpPut]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userId = _userService.GetCurrentUserId();
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

            var updatedUser = await _profileService.UpdateProfileAsync(
                userId,
                sanitizedFirstName,
                sanitizedLastName,
                sanitizedEmail
            );

            _securityLoggingService.LogProfileUpdate(userId, 
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

            return Ok(new UserDto(
                updatedUser.Id,
                updatedUser.Email,
                updatedUser.FirstName,
                updatedUser.LastName,
                updatedUser.Role,
                updatedUser.CreatedAt,
                updatedUser.UpdatedAt
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("password")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto request)
    {
        var userId = _userService.GetCurrentUserId();
        try
        {
            if (!ValidationService.IsValidPassword(request.NewPassword))
            {
                return BadRequest(new { message = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special characters" });
            }

            await _profileService.UpdatePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            
            _securityLoggingService.LogPasswordChange(userId, true, 
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
            
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            _securityLoggingService.LogPasswordChange(userId, false, 
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
            return BadRequest(new { message = "Current password is incorrect" });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = _userService.GetCurrentUserId();
        await _profileService.DeleteAccountAsync(userId);
        return NoContent();
    }
} 