# Project Status

**Last Updated**: February 2026

## Current Version

**Phase**: Active Development (MVP Complete + Payment Mode Feature)

## Completed Features

### Core Functionality

- [x] **Transaction Management** — Full CRUD (create, read, update, delete)
- [x] **Category Management** — Custom categories with icons, labels, and type classification
- [x] **Income Tracking** — Record and categorize income transactions
- [x] **Expense Tracking** — Record and categorize expense transactions
- [x] **Payment Mode Tracking** — Every transaction tagged with a payment mode (Cash, GCash, BDO Savings, CBS Checking)
- [x] **Dashboard Overview** — Summary cards showing balance, income, expenses, and savings rate

### Data Visualization

- [x] **Monthly Overview Chart** — Area chart showing income vs expenses over the last 6 months
- [x] **Category Breakdown Chart** — Pie chart showing expenses by category with percentages
- [x] **Payment Mode Summary** — Cash flow report cards showing income, expenses, and net flow per payment mode
- [x] **Stat Cards** — Four key metrics displayed prominently

### User Interface

- [x] **Responsive Design** — Works on mobile, tablet, and desktop
- [x] **Dark/Light Theme** — Full theme support with CSS variables
- [x] **Dialog-Based Forms** — Modal forms for adding and editing transactions (with payment mode selector)
- [x] **Toast Notifications** — Success and error feedback via Sonner
- [x] **Scrollable Transaction List** — Recent transactions with edit/delete actions, showing payment mode
- [x] **Payment Mode Filtering** — Click a payment mode card to filter the transaction list by that mode

### Infrastructure

- [x] **PostgreSQL Database** — Full relational database with Prisma ORM
- [x] **Database Migrations** — Version-controlled schema changes (including `add-payment-mode` migration)
- [x] **Database Seeding** — Default categories, payment modes, and sample data
- [x] **Docker Support** — Dockerfile and docker-compose for containerized development
- [x] **TypeScript** — Strict mode, full type coverage
- [x] **Vercel Analytics** — Page view and web vitals tracking

## Recent Milestones

| Date | Milestone | Branch/Commit |
|------|-----------|---------------|
| Feb 2026 | Added Payment Mode feature (Cash, GCash, BDO Savings, CBS Checking) with summary report and filtering | `payment-mode-options` |
| Feb 2026 | Docker setup for containerized development | `c5246c1` |
| Feb 2026 | Migrated from Neon cloud to local PostgreSQL | `35fd519` |
| Feb 2026 | Upgraded Prisma to v7.3 | `c6cfbfa` |
| Feb 2026 | Improved expense display by category | `9d18222` |
| Feb 2026 | Added edit functionality for transactions | `7e7c202` |

## Payment Mode Feature Details

Added in the `payment-mode-options` branch, this feature enables cash flow monitoring across payment channels:

- **Database**: New `PaymentMode` enum (`cash`, `gcash`, `bdo_savings`, `cbs_checking`) with `@default(cash)` on the Transaction model
- **UI**: Payment mode selector in add/edit dialogs, payment mode label in transaction list
- **Report**: "Cash Flow by Payment Mode" summary section on dashboard with 4 clickable cards
- **Filtering**: Click a payment mode card to filter the transaction list to only that mode
- **Server Action**: `getPaymentModeStats()` aggregates income/expenses/net flow per mode
- **Migration**: `20260210035519_add_payment_mode` — existing transactions default to `cash`

## Known Limitations

- **No Authentication** — The app is publicly accessible with no user login
- **Single User** — No multi-user or multi-tenant support
- **No Data Export** — Cannot export transactions to CSV/PDF
- **No Date Range Filtering** — Dashboard shows all-time data
- **No Budget Tracking** — No ability to set spending limits or budgets
- **No Recurring Transactions** — Each transaction must be entered manually
- **No Image Optimization** — Disabled in Next.js config for simplicity
- **Fixed Payment Modes** — Payment modes are defined as a Prisma enum; adding custom modes requires a schema migration

## Technical Debt

- [ ] TypeScript build errors are ignored in `next.config.mjs` (`ignoreBuildErrors: true`)
- [ ] Connection pool limited to 1 connection (may bottleneck under load)
- [ ] No automated tests (unit, integration, or e2e)
- [ ] No CI/CD pipeline configured
- [ ] Sample data in `lib/data.ts` is partially redundant with database seed
