# Plan: Deploy App to Another Machine with Fresh Database

## Goal
Deploy the Docker container to another machine with PostgreSQL installed on the host and a fresh database.

## Target Machine Setup Steps

### 1. Install Prerequisites
- Docker and Docker Compose
- PostgreSQL 16 (running on port 5432)

### 2. Create the Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE "FintrackerDB";
\q
```

### 3. Transfer Files to Target Machine
Copy these files/folders to the target machine:
- `Dockerfile`
- `docker-compose.yml`
- `prisma/` directory (contains schema and migrations)
- `package.json` and `package-lock.json`
- All source code (or clone from Git repository)

### 4. Create `.env` File on Target Machine
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<target-machine-postgres-password>
POSTGRES_DB=FintrackerDB
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/FintrackerDB
```

### 5. Run Database Migrations
Before starting the Docker container, run migrations to create the schema:

```bash
# Option A: Run migrations locally (requires Node.js installed)
npm install
npx prisma migrate deploy

# Option B: Run migrations via Docker (no Node.js needed)
docker build -t fintracker:latest .
docker run --rm --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:<password>@host.docker.internal:5432/FintrackerDB" \
  fintracker:latest \
  npx prisma migrate deploy
```

### 6. Start the Application
```bash
docker-compose up --build -d
```

The app will be available at `http://<machine-ip>:3001`

## Linux Host Note
On Linux, `host.docker.internal` may not work by default. Add this to `docker-compose.yml`:

```yaml
services:
  app:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

## Files to Modify

### `docker-compose.yml`
Add `extra_hosts` for Linux compatibility (optional but recommended):

```yaml
services:
  app:
    build: .
    ports:
      - "3001:3000"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@host.docker.internal:5432/${POSTGRES_DB:-FintrackerDB}"
```

## Verification
1. Check PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Check database exists: `psql -U postgres -l | grep FintrackerDB`
3. Check migrations applied: `npx prisma migrate status`
4. Access the app: `http://<machine-ip>:3001`
