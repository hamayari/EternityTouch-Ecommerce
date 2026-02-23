# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email us at: **eternity@touch.tn**

Please do NOT create a public GitHub issue for security vulnerabilities.

## Security Best Practices

### Environment Variables
- Never commit `.env` files to Git
- Use `.env.example` as a template
- Rotate credentials regularly
- Use strong, unique passwords

### MongoDB Credentials
⚠️ **IMPORTANT**: If you see MongoDB credentials in this repository's history, they have been rotated and are no longer valid.

### Secrets Management
- All sensitive data must be stored in environment variables
- Use GitHub Secrets for CI/CD pipelines
- Never hardcode credentials in source code

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Updates

We regularly update dependencies to patch security vulnerabilities. Dependabot is enabled for automated security updates.
