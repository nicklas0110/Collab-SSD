using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;

namespace CollabBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly IUserService _userService;

    public ProfileController(IProfileService profileService, IUserService userService)
    {
        _profileService = profileService;
        _userService = userService;
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
            var user = await _profileService.UpdateProfileAsync(userId, request.FirstName, request.LastName, request.Email);
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
        catch (InvalidOperationException ex)
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
            await _profileService.UpdatePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
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