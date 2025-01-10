# Threat Model

## Attack Surfaces

### Authentication
- Login endpoint (/api/auth/login)
- Registration endpoint (/api/auth/register)
- Password update endpoint (/api/profile/password)

### Message System
- Message creation and transmission
- Message storage and retrieval
- End-to-end encryption system

### Collaboration Features
- Collaboration creation and management
- User interactions within collaborations
- File sharing (if implemented)

## Potential Threats

### Authentication Threats
1. Brute Force Attacks
   - Mitigated by rate limiting (see Program.cs lines 127-152)
   - Password complexity requirements
   - Login attempt logging

2. Token Theft
   - JWT with zero clock skew
   - Secure token transmission
   - HTTPS enforcement

### Data Exposure Risks
1. Message Interception
   - End-to-end encryption
   - MAC verification
   - Digital signatures

2. Data at Rest
   - Encrypted storage
   - Key rotation
   - Secure key storage

### Infrastructure Threats
1. DoS Attacks
   - Rate limiting
   - Request size limits
   - Input validation

2. Injection Attacks
   - Input sanitization
   - Parameterized queries
   - Content Security Policy

## Mitigations

See implemented mitigations in:
- Program.cs (security headers, rate limiting)
- AuthController.cs (input validation)
- MessageService.cs (encryption, MAC, signatures)
- ValidationService.cs (input sanitization)

## Security Controls

### Preventive Controls
- Input validation
- Rate limiting
- Request size limits
- CORS policy

### Detective Controls
- Security event logging
- Login attempt monitoring
- Integrity checks (MAC)

### Responsive Controls
- Exception handling
- Security headers
- Error logging 