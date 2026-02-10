# Claude Rules

Rules and guidelines for AI-assisted development on the Yamban FinTracker project.

## Project Context

- **App Name**: Yamban FinTracker
- **Type**: Full-stack income/expense tracking application
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript
- **Database**: PostgreSQL via Prisma ORM v7.3
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)

## Code Style Rules

### General

- Use **TypeScript** for all files — no plain JavaScript
- Enable **strict mode** in TypeScript
- Use **ES6+** syntax (arrow functions, destructuring, template literals)
- Prefer `const` over `let`; never use `var`
- Use **named exports** over default exports where possible

### React & Next.js

- Use the **App Router** (`app/` directory) — do not create Pages Router files
- Mark interactive components with `"use client"` directive explicitly
- Mark server actions with `"use server"` directive explicitly
- Use **Server Actions** for all data mutations — do not create API routes (`app/api/`)
- Call `revalidatePath('/')` after every data mutation
- Use `useEffect` for data fetching in client components
- Prefer **functional components** with hooks — no class components

### File Naming

- Components: `kebab-case.tsx` (e.g., `add-transaction-dialog.tsx`)
- Server actions: `kebab-case.ts` in `app/actions/`
- Hooks: `use-kebab-case.ts` in `hooks/`
- Types: defined in `lib/types.ts`
- Utilities: defined in `lib/utils.ts`

### Styling

- Use **Tailwind CSS** utility classes — no inline styles or CSS modules
- Use the `cn()` helper from `lib/utils.ts` for conditional class merging
- Follow the existing **oklch color system** defined in `app/globals.css`
- Support both **light and dark themes** using CSS variables
- Use responsive breakpoints: `sm` (640px), `lg` (1024px)

### UI Components

- Use **shadcn/ui** components from `components/ui/` for all standard UI elements
- Do not install alternative UI libraries (no MUI, Chakra, Ant Design)
- Use **Lucide React** for icons — no other icon libraries
- Use **Sonner** for toast notifications
- Use **Recharts** for data visualization

## Database Rules

- Always use **Prisma** for database queries — no raw SQL unless absolutely necessary
- Define all models in `prisma/schema.prisma`
- Run `npx prisma migrate dev` after schema changes
- Run `npx prisma generate` after schema changes to update the client
- Use **CUID** for primary keys (`@default(cuid())`)
- Always include `createdAt` and `updatedAt` timestamps on models
- Add **indexes** on frequently queried columns

## Error Handling

- Wrap all server actions in `try-catch` blocks
- Return structured responses: `{ success: true, data }` or `{ success: false, error: string }`
- Log errors to console with descriptive messages
- Show user-friendly error messages via toast notifications
- Never expose raw database errors to the client

## Testing & Quality

- Run `npm run lint` before committing
- Run `npm run build` to verify no TypeScript errors
- Test all CRUD operations manually after changes
- Verify both light and dark themes render correctly

## Git Conventions

- Write descriptive commit messages (imperative mood)
- Keep commits focused — one logical change per commit
- Do not commit `.env` files or secrets
- Do not commit `node_modules/` or `.next/`
- Do not commit generated Prisma client files (`lib/generated/prisma/`)

## What NOT To Do

- Do not add authentication without explicit approval — the app is currently public
- Do not switch from Server Actions to API routes
- Do not replace Prisma with another ORM
- Do not replace shadcn/ui with another component library
- Do not add state management libraries (Redux, Zustand) — use React state
- Do not modify the Docker configuration without testing locally first
- Do not change the database connection pooling settings without benchmarking
