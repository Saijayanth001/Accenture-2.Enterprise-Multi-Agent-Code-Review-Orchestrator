---
description: Security-focused code review covering OWASP Top 10, secure coding practices, and vulnerability detection
---

# Security Analysis

Expert in identifying security vulnerabilities, OWASP Top 10 threats, and secure coding patterns.

## OWASP Top 10 Coverage

### A01: Broken Access Control
- Missing authentication checks
- Insecure direct object references
- Path traversal vulnerabilities
- Improper authorization logic

### A02: Cryptographic Failures
- Weak encryption algorithms
- Hardcoded secrets/credentials
- Insecure random number generation
- Missing encryption for sensitive data

### A03: Injection Attacks
- SQL injection (parameterized queries required)
- Command injection (avoid shell execution)
- XSS (Cross-Site Scripting) prevention
- LDAP, NoSQL, OS command injection
- Template injection

### A04: Insecure Design
- Missing security requirements
- Lack of defense in depth
- Insecure business logic
- Missing rate limiting

### A05: Security Misconfiguration
- Default credentials
- Verbose error messages
- Unnecessary features enabled
- Outdated dependencies

### A06: Vulnerable Components
- Known vulnerable dependencies
- Unmaintained libraries
- Missing security patches

### A07: Authentication Failures
- Weak password policies
- Missing MFA support
- Session fixation
- Credential stuffing risks

### A08: Software and Data Integrity
- Unsigned packages/updates
- Insecure deserialization
- Missing integrity checks

### A09: Security Logging Failures
- Insufficient logging
- Missing audit trails
- Log injection vulnerabilities

### A10: Server-Side Request Forgery (SSRF)
- Unvalidated URL inputs
- Missing whitelist for external requests

## Input Validation

- Sanitize all user inputs
- Validate data types, ranges, formats
- Reject unexpected input (fail securely)
- Encode outputs (HTML, URL, SQL)
- Use allowlists over blocklists

## Authentication & Authorization

- Strong password hashing (bcrypt, Argon2)
- Secure session management
- Token-based auth best practices (JWT)
- Principle of least privilege
- Role-based access control (RBAC)

## Data Protection

- Encrypt sensitive data at rest
- Use TLS for data in transit
- Secure API keys and secrets (environment vars)
- Never log sensitive information
- Implement proper key management

## Code Patterns

- Avoid eval(), exec(), Function()
- Sanitize dynamic SQL/NoSQL queries
- Use prepared statements
- Validate file uploads (type, size, content)
- Implement CSRF protection

## API Security

- Rate limiting on endpoints
- Input size limits
- Proper error handling (no stack traces to client)
- CORS configuration
- API authentication required

## Common Vulnerabilities

- ReDoS (Regular Expression Denial of Service)
- Prototype pollution (JavaScript/TypeScript)
- Path traversal (../../etc/passwd)
- Open redirects
- XXE (XML External Entity)

## Output:

For each security issue provide:
1. Vulnerability type and description
2. OWASP category if applicable
3. Attack scenario (how it could be exploited)
4. Remediation with secure code example
5. Severity level (critical, high, medium, low)
