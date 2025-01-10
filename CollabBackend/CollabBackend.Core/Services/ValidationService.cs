using System.Text.RegularExpressions;

namespace CollabBackend.Core.Services;

public static class ValidationService
{
    // Email validation
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        
        // RFC 5322 compliant email regex
        var regex = new Regex(@"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");
        return regex.IsMatch(email) && email.Length <= 256;
    }

    // Password validation
    public static bool IsValidPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password)) return false;

        var hasNumber = new Regex(@"[0-9]+");
        var hasUpperChar = new Regex(@"[A-Z]+");
        var hasLowerChar = new Regex(@"[a-z]+");
        var hasSymbols = new Regex(@"[!@#$%^&*()_+=\[{\]};:<>|./?,-]");
        var hasMinLength = password.Length >= 8;

        return hasNumber.IsMatch(password) &&
               hasUpperChar.IsMatch(password) &&
               hasLowerChar.IsMatch(password) &&
               hasSymbols.IsMatch(password) &&
               hasMinLength;
    }

    // Name validation
    public static bool IsValidName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        
        // Allow letters, spaces, hyphens, and apostrophes
        var regex = new Regex(@"^[a-zA-Z\s\-']{1,50}$");
        return regex.IsMatch(name);
    }

    // Content validation (for messages, descriptions etc.)
    public static bool IsValidContent(string content, int maxLength = 5000)
    {
        // Allow null or empty content
        if (string.IsNullOrWhiteSpace(content))
            return true;
        
        // Check for potentially dangerous patterns
        var dangerousPatterns = new[]
        {
            @"<script>",
            @"javascript:",
            @"data:",
            @"vbscript:",
            @"onload=",
            @"onerror="
        };

        return content.Length <= maxLength && 
               !dangerousPatterns.Any(pattern => 
                   content.Contains(pattern, StringComparison.OrdinalIgnoreCase));
    }

    // Sanitize input
    public static string SanitizeInput(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        // Replace potentially dangerous characters
        return input
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&apos;")
            .Replace("&", "&amp;");
    }

    // Collaboration-specific validation
    public static bool IsValidCollaborationTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return false;
        return title.Length >= 3 && title.Length <= 100 && !ContainsDangerousContent(title);
    }

    public static bool IsValidCollaborationDescription(string description)
    {
        // Allow null or empty description
        if (string.IsNullOrWhiteSpace(description))
            return true;
        
        return description.Length <= 1000 && !ContainsDangerousContent(description);
    }

    public static bool IsValidCollaborationStatus(string status)
    {
        var validStatuses = new[] { "active", "completed", "cancelled", "pending" };
        return validStatuses.Contains(status.ToLower());
    }

    // Message-specific validation
    public static bool IsValidMessageContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content)) return false;
        return content.Length >= 1 && content.Length <= 2000 && !ContainsDangerousContent(content);
    }

    private static bool ContainsDangerousContent(string content)
    {
        var dangerousPatterns = new[]
        {
            @"<script>",
            @"javascript:",
            @"data:",
            @"vbscript:",
            @"onload=",
            @"onerror=",
            @"<iframe",
            @"<img",
            @"<link",
            @"<meta"
        };

        return dangerousPatterns.Any(pattern => 
            content.Contains(pattern, StringComparison.OrdinalIgnoreCase));
    }
} 