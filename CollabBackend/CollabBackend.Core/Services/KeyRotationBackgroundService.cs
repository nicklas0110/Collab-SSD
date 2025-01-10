using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using CollabBackend.Core.Services;

public class KeyRotationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _configuration;
    private readonly ILogger<KeyRotationBackgroundService> _logger;

    public KeyRotationBackgroundService(
        IServiceProvider services,
        IConfiguration configuration,
        ILogger<KeyRotationBackgroundService> logger)
    {
        _services = services;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var rotationHours = _configuration.GetValue<int>("Crypto:KeyRotationHours", 24);
                
                await Task.Delay(TimeSpan.FromHours(rotationHours), stoppingToken);

                using var scope = _services.CreateScope();
                var keyRotationService = scope.ServiceProvider.GetRequiredService<KeyRotationService>();
                
                await keyRotationService.RotateKeysAsync();
                _logger.LogInformation("Cryptographic keys rotated successfully");
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during key rotation");
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }
    }
} 