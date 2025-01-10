using System;

namespace CollabBackend.Core.Interfaces;

public interface IUserService
{
    Guid GetCurrentUserId();
} 