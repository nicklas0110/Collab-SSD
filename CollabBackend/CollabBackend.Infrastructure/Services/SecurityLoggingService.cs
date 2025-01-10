using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CollabBackend.Core.Interfaces;

namespace CollabBackend.Infrastructure.Services;

public class SecurityLoggingService : ISecurityLoggingService
{
    private readonly ILogger<SecurityLoggingService> _logger;

    public SecurityLoggingService(ILogger<SecurityLoggingService> logger)
    {
        _logger = logger;
    }

    public void LogLoginAttempt(string email, bool success, string ipAddress)
    {
        if (success)
        {
            _logger.LogInformation("Successful login attempt for user {Email} from IP {IpAddress}", 
                email, ipAddress);
        }
        else
        {
            _logger.LogWarning("Failed login attempt for user {Email} from IP {IpAddress}", 
                email, ipAddress);
        }
    }

    public void LogPasswordChange(Guid userId, bool success, string ipAddress)
    {
        if (success)
        {
            _logger.LogInformation("Password changed successfully for user {UserId} from IP {IpAddress}", 
                userId, ipAddress);
        }
        else
        {
            _logger.LogWarning("Failed password change attempt for user {UserId} from IP {IpAddress}", 
                userId, ipAddress);
        }
    }

    public void LogUnauthorizedAccess(string resource, string ipAddress)
    {
        _logger.LogWarning("Unauthorized access attempt to {Resource} from IP {IpAddress}", 
            resource, ipAddress);
    }

    public void LogSecurityEvent(string eventType, string description, string ipAddress, LogLevel severity)
    {
        _logger.Log(severity, "{EventType}: {Description} from IP {IpAddress}", 
            eventType, description, ipAddress);
    }

    public void LogProfileUpdate(Guid userId, string ipAddress)
    {
        _logger.LogInformation("Profile updated for user {UserId} from IP {IpAddress}", 
            userId, ipAddress);
    }

    public void LogCollaborationAccess(Guid userId, Guid collaborationId, string action, string ipAddress)
    {
        _logger.LogInformation("User {UserId} performed {Action} on collaboration {CollaborationId} from IP {IpAddress}", 
            userId, action, collaborationId, ipAddress);
    }
} 