# Contributing

Guidelines for contributing to the Yamban FinTracker project.

## Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** v22 or later
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (for local database)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd income-expense-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/FintrackerDB"
```

See [ENVIRONMENT.md](ENVIRONMENT.md) for full details.

### 4. Set Up the Database

**Option A: Local PostgreSQL**

```bash
# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

**Option B: Docker**

```bash
docker-compose up
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`.

## Development Workflow

### Branch Strategy

1. Create a new branch from `main` for each feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following the code style guidelines below.

3. Test your changes locally.

4. Commit with a descriptive message:
   ```bash
   git commit -m "Add expense filtering by date range"
   ```

5. Push and open a pull request against `main`.

### Commit Message Format

Use **imperative mood** in commit messages:

- `Add transaction export feature`
- `Fix category deletion validation`
- `Update dashboard chart colors`
- `Migrate to local DB`

### Code Style

- **TypeScript only** — no plain JavaScript files
- **Tailwind CSS** for styling — no CSS modules or inline styles
- **shadcn/ui** for UI components
- **Server Actions** for data operations — no API routes
- **Functional components** with hooks — no class components

See [CLAUDE_RULES.md](CLAUDE_RULES.md) for the full code style guide.

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and layouts |
| `app/actions/` | Server Actions (business logic) |
| `components/` | React components |
| `components/ui/` | shadcn/ui component library |
| `hooks/` | Custom React hooks |
| `lib/` | Shared utilities, types, Prisma client |
| `prisma/` | Database schema, migrations, seed |
| `public/` | Static assets |

## Adding a New Feature

### Adding a New Server Action

1. Add the function to the appropriate file in `app/actions/`
2. Mark it with `"use server"` at the top of the file
3. Add proper error handling with try-catch
4. Call `revalidatePath('/')` after mutations
5. Return structured responses: `{ success: true, data }` or error

### Adding a New Component

1. Create the file in `components/` using kebab-case naming
2. Use `"use client"` directive if the component is interactive
3. Use shadcn/ui primitives and Tailwind classes for styling
4. Support both light and dark themes

### Adding a New UI Primitive

```bash
npx shadcn@latest add <component-name>
```

This installs the component into `components/ui/`.

### Modifying the Database Schema

1. Edit `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name describe-your-change`
3. Regenerate client: `npx prisma generate`
4. Update seed script if needed: `prisma/seed.ts`
5. Update TypeScript types in `lib/types.ts`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db seed` | Seed the database |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

## Quality Checklist

Before submitting a pull request, verify:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] All CRUD operations work correctly
- [ ] Both light and dark themes render properly
- [ ] Responsive design works on mobile and desktop
- [ ] No `.env` files or secrets are committed
- [ ] Database migrations are included if schema changed
- [ ] Commit messages are clear and descriptive

## Reporting Issues

When reporting a bug, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and OS information
5. Console error logs (if applicable)
