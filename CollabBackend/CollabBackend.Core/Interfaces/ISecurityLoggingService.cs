using System;
using Microsoft.Extensions.Logging;
namespace CollabBackend.Core.Interfaces;

public interface ISecurityLoggingService
{
    void LogLoginAttempt(string email, bool success, string ipAddress);
    void LogPasswordChange(Guid userId, bool success, string ipAddress);
    void LogUnauthorizedAccess(string resource, string ipAddress);
    void LogSecurityEvent(string eventType, string description, string ipAddress, LogLevel severity);
    void LogProfileUpdate(Guid userId, string ipAddress);
    void LogCollaborationAccess(Guid userId, Guid collaborationId, string action, string ipAddress);
} 