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
  id          String          @id @default(cuid())
  description String
  amount      Float
  type        TransactionType
  categoryId  String
  category    Category        @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  date        DateTime        @default(now())
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([type])
  @@index([categoryId])
  @@index([date])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (CUID) | Primary key |
| `description` | String | Transaction description |
| `amount` | Float | Transaction amount |
| `type` | TransactionType | `income` or `expense` |
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
│ type             │  └───>│ categoryId (FK)  │
│ createdAt        │       │ date             │
│ updatedAt        │       │ createdAt        │
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

## Seed Data

The database is seeded with **16 default categories**:

### Income Categories

| Name | Label | Icon |
|------|-------|------|
| salary | Salary | ![salary] |
| freelance | Freelance | ![freelance] |
| investments | Investments | ![investments] |
| other-income | Other Income | ![other-income] |

### Expense Categories

| Name | Label | Icon |
|------|-------|------|
| food | Food & Dining | ![food] |
| gas | Gas | ![gas] |
| repair | Repair & Maintenance | ![repair] |
| electricity | Electricity | ![electricity] |
| water | Water | ![water] |
| internet | Internet | ![internet] |
| phone | Phone | ![phone] |
| other-utilities | Other Utilities | ![other-utilities] |
| entertainment | Entertainment | ![entertainment] |
| shopping | Shopping | ![shopping] |
| health | Health | ![health] |
| other-expense | Other Expense | ![other-expense] |

## Database Rules

### Schema Rules

1. **Primary Keys**: Always use CUID (`@default(cuid())`) for IDs
2. **Timestamps**: Every model must include `createdAt` and `updatedAt`
3. **Naming**: Model names in PascalCase, column names in camelCase
4. **Enums**: Use Prisma enums for fixed value sets
5. **Indexes**: Add indexes on columns used in WHERE, ORDER BY, or JOIN clauses
6. **Relations**: Always define explicit foreign key constraints
7. **Deletion**: Use `onDelete: Restrict` to prevent orphaned records

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
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Regenerate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status
```
