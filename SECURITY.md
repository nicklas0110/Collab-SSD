# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

### Authentication & Authorization
- JWT-based authentication with zero clock skew
- Password complexity requirements enforced
- Rate limiting on auth endpoints (5 attempts/5min)
- Secure password hashing using BCrypt

### Data Protection
- End-to-end encryption for messages
- Asymmetric encryption for sensitive content
- MAC for message integrity
- Digital signatures for non-repudiation
- Key rotation every 24 hours

### API Security
- Request size limits (10MB max)
- Rate limiting (30 requests/min general, 10/min for messages)
- Input validation and sanitization
- Security headers (CSP, X-Frame-Options, etc.)
- CORS restrictions to trusted origins

### Monitoring & Logging
- Security event logging
- Login attempt tracking
- IP address logging
- Structured logging with Serilog

## Reporting a Vulnerability

Please report security vulnerabilities by emailing security@yourcompany.com.
Do not create public GitHub issues for security vulnerabilities.

## Security Configuration

Ensure these settings in appsettings.json:
- Strong JWT key (min 32 characters)
- Proper crypto keys configuration
- Rate limiting rules
- CORS policy 