# Environment

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

## Environment Files

| File | Purpose | Committed to Git |
|------|---------|-----------------|
| `.env` | Local development variables | No |
| `.env.production` | Production overrides | No |

## DATABASE_URL Format

```
postgresql://<username>:<password>@<host>:<port>/<database>
```

### Examples

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/FintrackerDB"
```

**Docker (app container accessing host DB):**
```env
DATABASE_URL="postgresql://postgres:yourpassword@host.docker.internal:5432/FintrackerDB"
```

**Neon (cloud PostgreSQL):**
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

## Setup Instructions

### 1. Create the `.env` File

Copy the template below into a `.env` file at the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/FintrackerDB"
```

### 2. Configure for Your Environment

**Local Development (without Docker):**
- Install PostgreSQL locally
- Create a database named `FintrackerDB`
- Set the connection string to point to `localhost:5432`

**Local Development (with Docker):**
- Use `host.docker.internal` instead of `localhost` for the host
- The app container maps port `3001` (host) to `3000` (container)

**Cloud Database (Neon, Supabase, etc.):**
- Use the connection string provided by your cloud provider
- Append `?sslmode=require` for SSL connections

### 3. Initialize the Database

```bash
# Apply schema migrations
npx prisma migrate dev

# Seed with default categories and sample data
npx prisma db seed
```

## Docker Environment

When running with Docker Compose, the `.env` file is automatically loaded. The Docker setup uses:

- **Node.js 22 Alpine** as the base image
- **Port mapping**: `3001` (host) → `3000` (container)
- **Volume mounts**: Source code and persistent `node_modules`
- **Network**: Uses `host.docker.internal` to reach the host machine's PostgreSQL

```bash
# Start the application with Docker
docker-compose up

# Rebuild after dependency changes
docker-compose up --build
```

## Port Configuration

| Service | Default Port |
|---------|-------------|
| Next.js Dev Server | 3001 |
| Next.js (inside Docker) | 3000 |
| PostgreSQL | 5432 |
| Prisma Studio | 5555 |

## Troubleshooting

### Connection Refused

- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check the `DATABASE_URL` format (no extra quotes or whitespace)
- For Docker, ensure `host.docker.internal` resolves correctly

### Migration Errors

- Run `npx prisma migrate status` to check pending migrations
- Run `npx prisma migrate reset` to drop and recreate the database (destroys data)

### Prisma Client Out of Date

- Run `npx prisma generate` after any schema change
- Restart the dev server after regenerating
