# Database Rules and Schema

## Database Overview

- **Database Engine**: PostgreSQL
- **ORM**: Prisma v7.3
- **Adapter**: `@prisma/adapter-pg` (optimized PostgreSQL driver)
- **Generated Client**: `lib/generated/prisma/`

## Schema Definition

### Enum: TransactionType

```prisma
enum TransactionType {
  income
  expense
}
```

### Enum: PaymentMode

```prisma
enum PaymentMode {
  cash
  gcash
  bdo_savings
  cbs_checking
}
```

| Value | Display Label | Icon |
|-------|--------------|------|
| `cash` | Cash | 💵 |
| `gcash` | GCash | 📱 |
| `bdo_savings` | BDO Savings | 🏦 |
| `cbs_checking` | CBS Checking | 🏛️ |

### Model: Category

```prisma
model Category {
  id           String          @id @default(cuid())
  name         String          @unique
  label        String
  icon         String?
  type         TransactionType
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  transactions Transaction[]

  @@index([type])
  @@index([name])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String (unique) | Internal identifier (e.g., `"salary"`, `"food"`) |
| `label` | String | Display name (e.g., `"Salary"`, `"Food & Dining"`) |
| `icon` | String? | Emoji or icon identifier (optional) |
| `type` | TransactionType | `income` or `expense` |
| `createdAt` | DateTime | Auto-set on creation |
| `updatedAt` | DateTime | Auto-updated on modification |

### Model: Transaction

```prisma
model Transaction {
  id          String      @id @default(cuid())
  description String
  amount      Float
  type        TransactionType
  paymentMode PaymentMode @default(cash)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  date        DateTime    @default(now())
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([type])
  @@index([categoryId])
  @@index([date])
  @@index([paymentMode])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (CUID) | Primary key |
| `description` | String | Transaction description |
| `amount` | Float | Transaction amount |
| `type` | TransactionType | `income` or `expense` |
| `paymentMode` | PaymentMode | Payment channel (`cash`, `gcash`, `bdo_savings`, `cbs_checking`). Defaults to `cash` |
| `categoryId` | String | Foreign key to Category |
| `date` | DateTime | Transaction date |
| `createdAt` | DateTime | Auto-set on creation |
| `updatedAt` | DateTime | Auto-updated on modification |

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│    Category       │       │   Transaction     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │
│ name (unique)    │  │    │ description      │
│ label            │  │    │ amount           │
│ icon             │  │    │ type             │
│ type             │  └───>│ paymentMode      │
│ createdAt        │       │ categoryId (FK)  │
│ updatedAt        │       │ date             │
│                  │       │ createdAt        │
│                  │       │ updatedAt        │
└──────────────────┘       └──────────────────┘
     One                        Many
```

## Relationships

| Relationship | Type | Constraint |
|-------------|------|------------|
| Category → Transaction | One-to-Many | A category has many transactions |
| Transaction → Category | Many-to-One | `onDelete: Restrict` — cannot delete a category that has transactions |

## Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| Category | `type` | Filter categories by income/expense |
| Category | `name` | Lookup by internal name |
| Transaction | `type` | Filter transactions by income/expense |
| Transaction | `categoryId` | Join queries with Category |
| Transaction | `date` | Sort and filter by date |
| Transaction | `paymentMode` | Filter transactions by payment mode |

## Seed Data

The database is seeded with **16 default categories**:

### Income Categories

| Name | Label | Icon |
|------|-------|------|
| salary | Salary | 💼 |
| freelance | Freelance | 💻 |
| investments | Investments | 📈 |
| other-income | Other Income | 💰 |

### Expense Categories

| Name | Label | Icon |
|------|-------|------|
| food | Food & Dining | 🍔 |
| gas | Gas | ⛽ |
| repair | Repair & Maintenance | 🔧 |
| electricity | Electricity | ⚡ |
| water | Water | 💧 |
| internet | Internet | 🌐 |
| phone | Phone | 📱 |
| other-utilities | Other Utilities | 🔌 |
| entertainment | Entertainment | 🎬 |
| shopping | Shopping | 🛍️ |
| health | Health | 🏥 |
| other-expense | Other Expense | 📦 |

### Sample Transactions

Seeded transactions are distributed across all four payment modes (Cash, GCash, BDO Savings, CBS Checking) for realistic demo data.

## Migrations

| Migration | Date | Description |
|-----------|------|-------------|
| `20260209085304_init` | Feb 2026 | Initial schema with Transaction and Category models |
| `20260210035519_add_payment_mode` | Feb 2026 | Added `PaymentMode` enum, `paymentMode` field (default: `cash`), and index |

## Database Rules

### Schema Rules

1. **Primary Keys**: Always use CUID (`@default(cuid())`) for IDs
2. **Timestamps**: Every model must include `createdAt` and `updatedAt`
3. **Naming**: Model names in PascalCase, column names in camelCase
4. **Enums**: Use Prisma enums for fixed value sets (e.g., `TransactionType`, `PaymentMode`)
5. **Indexes**: Add indexes on columns used in WHERE, ORDER BY, or JOIN clauses
6. **Relations**: Always define explicit foreign key constraints
7. **Deletion**: Use `onDelete: Restrict` to prevent orphaned records
8. **Defaults**: Use `@default()` for fields that have sensible defaults (e.g., `paymentMode @default(cash)`)

### Query Rules

1. **Use Prisma Client** — no raw SQL unless performance requires it
2. **Include relations** when needed: `include: { category: true }`
3. **Order results** explicitly: `orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]`
4. **Validate before write** — check foreign keys exist before creating records
5. **Handle errors gracefully** — wrap queries in try-catch blocks

### Migration Rules

1. Always use `npx prisma migrate dev --name <description>` for schema changes
2. Never edit migration files after they have been applied
3. Run `npx prisma generate` after every schema change
4. Update the seed script (`prisma/seed.ts`) when adding new models or fields
5. Test migrations on a local database before applying to production

## Connection Configuration

```typescript
// lib/prisma.ts
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 1,                    // Maximum connections
  idleTimeoutMillis: 20000,  // Close idle connections after 20s
  connectionTimeoutMillis: 10000  // Timeout after 10s
});
```

## Useful Commands

```bash
# Run migrations
npx prisma migrate dev

# Create a named migration
npx prisma migrate dev --name add-new-field

# Reset database (drops all data)
npx prisma migrate reset

# Seed the database
npx tsx -r dotenv/config prisma/seed.ts

# Open Prisma Studio (GUI)
npx prisma studio

# Regenerate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status
```
