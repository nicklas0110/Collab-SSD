using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;

namespace CollabBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IUserService _userService;

    public UsersController(IUserRepository userRepository, IUserService userService)
    {
        _userRepository = userRepository;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserDto(
            u.Id, 
            u.Email, 
            u.FirstName, 
            u.LastName, 
            u.Role,
            u.CreatedAt,
            u.UpdatedAt
        )).ToList();
    }
} 