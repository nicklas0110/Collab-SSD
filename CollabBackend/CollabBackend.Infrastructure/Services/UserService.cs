using System;
using System.Security.Claims;
using CollabBackend.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CollabBackend.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        return Guid.Parse(userIdClaim.Value);
    }
} 