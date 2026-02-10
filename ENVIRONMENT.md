# Environment

## Required Environment Variables

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | Next.js / Prisma | PostgreSQL connection string for the application |
| `POSTGRES_PASSWORD` | Yes | Docker Compose | PostgreSQL password (referenced by `docker-compose.yml`) |
| `POSTGRES_USER` | No | Docker Compose | PostgreSQL user (defaults to `postgres`) |
| `POSTGRES_DB` | No | Docker Compose | PostgreSQL database name (defaults to `FintrackerDB`) |

## Environment Files

| File | Purpose | Committed to Git |
|------|---------|-----------------|
| `.env` | Local development variables and Docker secrets | No |
| `.env.example` | Template with placeholder values for new developers | Yes |
| `.env.production` | Production overrides | No |

## Setup Instructions

### 1. Create the `.env` File

Copy the example file and fill in your password:

```bash
cp .env.example .env
```

Then edit `.env` and replace `your_password_here` with your actual password:

```env
# PostgreSQL credentials (used by docker-compose.yml)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=FintrackerDB

# Application database connection (used by Next.js / Prisma)
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5433/FintrackerDB"
```

### 2. How Variables Are Used

**Docker Compose** reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `.env` via variable substitution (`${POSTGRES_PASSWORD}`). These configure the PostgreSQL container and build the app container's `DATABASE_URL`.

**Next.js / Prisma** reads `DATABASE_URL` from `.env` for local development (running outside Docker). When running inside Docker, the app container gets its `DATABASE_URL` from the compose environment.

### 3. DATABASE_URL Format

```
postgresql://<username>:<password>@<host>:<port>/<database>
```

#### Examples

**Local dev (host machine to Docker PostgreSQL):**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5433/FintrackerDB"
```

**Inside Docker (app container to db container):**
```
DATABASE_URL=postgresql://postgres:yourpassword@db:5432/FintrackerDB
```
This is automatically constructed by `docker-compose.yml` from the `POSTGRES_*` variables.

**Neon (cloud PostgreSQL):**
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 4. Initialize the Database

```bash
# Apply schema migrations
npx prisma migrate dev

# Seed with default categories and sample data
npx tsx -r dotenv/config prisma/seed.ts
```

## Docker Environment

Docker Compose reads the `.env` file automatically. The compose file uses variable substitution with defaults:

```yaml
environment:
  - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-FintrackerDB}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

This means:
- `POSTGRES_PASSWORD` is **required** in `.env` (no default)
- `POSTGRES_USER` defaults to `postgres` if not set
- `POSTGRES_DB` defaults to `FintrackerDB` if not set

```bash
# Start the application with Docker
docker-compose up

# Rebuild after dependency changes
docker-compose up --build
```

## Port Configuration

| Service | Default Port |
|---------|-------------|
| Next.js Dev Server (host) | 3001 |
| Next.js (inside Docker) | 3000 |
| PostgreSQL (host) | 5433 |
| PostgreSQL (inside Docker) | 5432 |
| Prisma Studio | 5555 |

## Troubleshooting

### Connection Refused

- Verify PostgreSQL is running: `docker-compose ps`
- Check the `DATABASE_URL` format (no extra quotes or whitespace)
- For host-to-Docker connections, use `localhost:5433` (the mapped port)
- For container-to-container connections, use `db:5432` (the internal port)

### Docker Compose Fails with Empty Password

- Ensure `POSTGRES_PASSWORD` is set in your `.env` file
- Docker Compose reads `.env` automatically from the project root

### Migration Errors

- Run `npx prisma migrate status` to check pending migrations
- Run `npx prisma migrate reset` to drop and recreate the database (destroys data)

### Prisma Client Out of Date

- Run `npx prisma generate` after any schema change
- Restart the dev server after regenerating
