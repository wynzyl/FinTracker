# Security

Security considerations, current posture, and guidelines for the Yamban FinTracker project.

## Current Security Posture

### Authentication & Authorization

| Area | Status | Notes |
|------|--------|-------|
| User Authentication | Not implemented | App is publicly accessible |
| Session Management | Not implemented | No login/session system |
| Role-Based Access | Not implemented | Single-role, no admin distinction |
| API Protection | Not applicable | Uses Server Actions, not REST API |

### Data Protection

| Area | Status | Notes |
|------|--------|-------|
| Database Encryption | At-rest (PostgreSQL default) | Connection via standard PostgreSQL |
| Data in Transit | HTTPS in production | Local dev uses HTTP |
| Input Validation | Partial | Server-side checks in actions |
| SQL Injection | Protected | Prisma ORM parameterizes all queries |
| XSS Protection | Protected | React auto-escapes rendered content |
| CSRF Protection | Protected | Next.js Server Actions include CSRF tokens |

## Security Guidelines

### Environment Variables

- **Never commit `.env` files** to version control
- Store secrets only in environment variables, not in source code
- Use different credentials for development and production
- Rotate database passwords periodically
- The `.gitignore` file excludes `.env*` files

### Database Security

- **Connection string**: Keep `DATABASE_URL` confidential
- **Connection pooling**: Limited to 1 max connection with timeouts to prevent resource exhaustion
- **Foreign key constraints**: `onDelete: Restrict` prevents accidental data loss
- **Prisma ORM**: All queries are parameterized — no raw SQL injection risk
- **No direct database exposure**: Database is only accessible through Server Actions

### Server Actions

- All data mutations go through Next.js Server Actions
- Server Actions validate input before database operations
- Errors are caught and sanitized before returning to the client
- Raw database errors are never exposed to the user

### Frontend Security

- React automatically escapes all rendered content (XSS protection)
- No `dangerouslySetInnerHTML` usage
- No user-generated HTML rendering
- Client-side state does not contain sensitive data

### Docker Security

- Uses `node:22-alpine` (minimal attack surface)
- Application runs as non-root where possible
- `node_modules` volume is isolated
- `.dockerignore` excludes sensitive files from the build context

## Sensitive Files

The following files must **never** be committed to version control:

```
.env
.env.local
.env.production
.env.development
```

These are already listed in `.gitignore`.

## Known Security Gaps

### High Priority

1. **No Authentication**: Any user can access and modify all data
   - **Risk**: Unauthorized data access and modification
   - **Mitigation**: Deploy behind a private network or add authentication (see Roadmap Phase 2)

2. **No Rate Limiting**: Server Actions have no request throttling
   - **Risk**: Potential abuse or denial of service
   - **Mitigation**: Add rate limiting middleware or deploy behind a CDN with DDoS protection

### Medium Priority

3. **No Input Sanitization Library**: Relies on Prisma parameterization only
   - **Risk**: Edge cases in non-database operations
   - **Mitigation**: Add Zod validation schemas on all server action inputs

4. **No Audit Logging**: No record of who changed what and when
   - **Risk**: Cannot trace unauthorized changes
   - **Mitigation**: Add an audit log table tracking mutations with timestamps

5. **TypeScript Build Errors Ignored**: `ignoreBuildErrors: true` in Next.js config
   - **Risk**: Type-level bugs may slip into production
   - **Mitigation**: Fix build errors and remove the ignore flag

### Low Priority

6. **No Content Security Policy (CSP)**: No CSP headers configured
   - **Mitigation**: Add CSP headers in `next.config.mjs`

7. **No CORS Configuration**: Default Next.js CORS behavior
   - **Mitigation**: Not critical since there are no API routes, but should be configured if REST APIs are added

## Dependency Security

### Keeping Dependencies Updated

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Key Dependencies to Monitor

| Package | Why |
|---------|-----|
| `next` | Core framework — security patches are critical |
| `prisma` | Database layer — SQL injection prevention |
| `react` | UI framework — XSS prevention |
| `pg` | PostgreSQL driver — connection security |

## Reporting Vulnerabilities

If you discover a security vulnerability in this project:

1. **Do not** open a public issue
2. Contact the project maintainer directly
3. Provide a detailed description of the vulnerability
4. Allow reasonable time for a fix before disclosure

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] Environment variables are set securely (not hardcoded)
- [ ] Database credentials are unique to the environment
- [ ] HTTPS is enforced
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Build completes without errors
- [ ] Authentication is implemented (or app is behind private network)
- [ ] Rate limiting is configured
- [ ] Error messages do not leak sensitive information
- [ ] Logging is configured for monitoring
