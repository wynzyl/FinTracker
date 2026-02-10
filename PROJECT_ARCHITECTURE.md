# Project Architecture

## Overview

Yamban FinTracker is a full-stack income and expense tracking application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **PostgreSQL**. The application follows a server-action-based architecture with no traditional REST API routes.

## Directory Structure

```
income-expense-app/
├── app/                            # Next.js App Router (entry point)
│   ├── layout.tsx                  # Root layout with metadata & providers
│   ├── page.tsx                    # Home page (renders Dashboard)
│   ├── globals.css                 # Global styles, CSS variables, Tailwind
│   └── actions/                    # Server Actions (business logic)
│       ├── transactions.ts         # Transaction CRUD & aggregation
│       └── categories.ts           # Category CRUD & filtering
│
├── components/                     # React components
│   ├── dashboard.tsx               # Main dashboard (client component)
│   ├── header.tsx                  # App header with navigation
│   ├── add-transaction-dialog.tsx  # Create transaction modal
│   ├── edit-transaction-dialog.tsx # Edit transaction modal
│   ├── category-management-dialog.tsx # Category admin panel
│   ├── transaction-list.tsx        # Recent transactions display
│   ├── overview-chart.tsx          # Area chart (monthly income vs expenses)
│   ├── category-chart.tsx          # Pie chart (expenses by category)
│   ├── stat-card.tsx               # Statistics display card
│   ├── theme-provider.tsx          # Light/dark theme context
│   └── ui/                         # shadcn/ui component library (25+ components)
│
├── hooks/                          # Custom React hooks
│   ├── use-mobile.ts              # Mobile viewport detection
│   └── use-toast.ts               # Toast notification hook
│
├── lib/                            # Shared utilities & configuration
│   ├── prisma.ts                  # Prisma client singleton with connection pooling
│   ├── types.ts                   # TypeScript type definitions
│   ├── utils.ts                   # Utility functions (cn helper)
│   ├── data.ts                    # Sample data & category mappings
│   └── generated/prisma/          # Auto-generated Prisma client types
│
├── prisma/                         # Database layer
│   ├── schema.prisma              # Database schema definition
│   ├── seed.ts                    # Database seeding script
│   ├── migrations/                # SQL migration history
│   └── migration_lock.toml        # Migration lock file
│
├── public/                         # Static assets (icons, logos)
├── styles/                         # Additional stylesheets
├── docker-compose.yml             # Docker services configuration
├── Dockerfile                     # Application container definition
└── Configuration files            # next.config, tsconfig, postcss, etc.
```

## Architecture Layers

### 1. Presentation Layer (`components/`)

- **Client Components**: Interactive UI elements using `"use client"` directive
- **shadcn/ui**: Pre-built, accessible UI primitives via Radix UI
- **Recharts**: Data visualization (area charts, pie charts)
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm, lg)

### 2. Business Logic Layer (`app/actions/`)

- **Server Actions**: All data mutations and queries use Next.js Server Actions (`"use server"`)
- **No REST API**: The app does not expose traditional API routes
- **Validation**: Server-side validation before database operations
- **Cache Revalidation**: `revalidatePath('/')` after every mutation

### 3. Data Access Layer (`lib/prisma.ts`, `prisma/`)

- **Prisma ORM**: Type-safe database queries with auto-generated client
- **Connection Pooling**: PostgreSQL connections managed via `pg` library (max 1, idle timeout 20s)
- **Singleton Pattern**: Single Prisma client instance reused across requests in development

## Data Flow

```
User Interaction
    ↓
Client Component (React state + event handlers)
    ↓
Server Action (validation + business logic)
    ↓
Prisma Client (type-safe queries)
    ↓
PostgreSQL Database
    ↓
Response → revalidatePath('/') → UI Update
```

## Key Server Actions

| Action | File | Purpose |
|--------|------|---------|
| `getTransactions()` | transactions.ts | Fetch all transactions with category data |
| `createTransaction()` | transactions.ts | Create a new transaction |
| `updateTransaction()` | transactions.ts | Update an existing transaction |
| `deleteTransaction()` | transactions.ts | Delete a transaction by ID |
| `getMonthlyStats()` | transactions.ts | Last 6 months income/expense aggregation |
| `getCategoryStats()` | transactions.ts | Expense breakdown by category |
| `getCategories()` | categories.ts | Fetch all categories |
| `getCategoriesByType()` | categories.ts | Filter categories by income/expense |
| `createCategory()` | categories.ts | Create a new category |
| `updateCategory()` | categories.ts | Update category details |
| `deleteCategory()` | categories.ts | Delete category (with safety check) |

## State Management

- **No external state library** — uses React `useState` and `useEffect`
- Dashboard component manages global app state (transactions, monthly data, totals)
- Data is fetched on mount and refreshed after mutations via callback props

## Rendering Strategy

- **Root Layout**: Server Component (provides metadata, fonts, theme provider)
- **Home Page**: Server Component (renders Dashboard)
- **Dashboard**: Client Component (manages state, calls server actions)
- **Dialogs & Forms**: Client Components (interactive user input)

## Deployment Architecture

```
┌─────────────────────────┐
│      Docker Host         │
│  ┌───────────────────┐  │
│  │  App Container     │  │
│  │  (Node.js 22)      │  │
│  │  Port 3001 → 3000  │  │
│  └────────┬──────────┘  │
│           │              │
│  ┌────────▼──────────┐  │
│  │  PostgreSQL        │  │
│  │  (host.docker.     │  │
│  │   internal:5432)   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```
