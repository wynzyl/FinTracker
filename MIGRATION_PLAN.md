# Migration Plan: Income-Expense App to Next.js Fullstack

## 📋 Current State Analysis

### ✅ Already Implemented
- **Next.js 16** with App Router
- **TailwindCSS v4.1.9** (fully configured)
- **TypeScript** (strict mode enabled)
- **React 19** with client components
- **UI Components** (shadcn/ui with Radix UI)
- **Data Types** (`lib/types.ts`)

### ❌ Missing (To Be Added)
- **Database**: Currently using in-memory state (`useState`)
- **Backend API**: No API routes or Server Actions
- **Data Persistence**: Sample data in `lib/data.ts`
- **ORM**: No database layer

---

## 🎯 Migration Goals

Transform the app from **client-side only** to **fullstack** with:
1. **NeonDB Postgres** - Serverless PostgreSQL database
2. **Prisma ORM** - Type-safe database access
3. **Next.js Server Actions** - API endpoints (simpler than API routes)
4. **Data Migration** - Move from sample data to database

---

## 📦 Step-by-Step Migration Plan

### **Phase 1: Setup Database & Prisma** ⏱️ ~30 min

#### 1.1 Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

#### 1.2 Initialize Prisma
```bash
npx prisma init
```

#### 1.3 Configure Environment Variables
Create/update `.env`:
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

#### 1.4 Create Prisma Schema
**File**: `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Transaction {
  id          String   @id @default(cuid())
  description String
  amount      Float
  type        TransactionType
  category    Category
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([category])
  @@index([date])
}

enum TransactionType {
  income
  expense
}

enum Category {
  salary
  freelance
  investments
  otherIncome
  food
  gas
  repair
  utilities
  entertainment
  shopping
  health
  otherExpense
}
```

#### 1.5 Generate Prisma Client
```bash
npx prisma generate
npx prisma db push
```

---

### **Phase 2: Create Database Utilities** ⏱️ ~20 min

#### 2.1 Create Prisma Client Singleton
**File**: `lib/prisma.ts` (NEW)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 2.2 Update Types
**File**: `lib/types.ts` (UPDATE)
- Keep existing types for frontend compatibility
- Prisma will generate its own types automatically

---

### **Phase 3: Create Server Actions** ⏱️ ~45 min

#### 3.1 Create Server Actions File
**File**: `app/actions/transactions.ts` (NEW)
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Transaction, Category, TransactionType } from '@/lib/types'

export async function getTransactions() {
  // Fetch from database
}

export async function createTransaction(data: Omit<Transaction, 'id'>) {
  // Create in database
}

export async function deleteTransaction(id: string) {
  // Delete from database
}

export async function getMonthlyStats() {
  // Calculate monthly income/expenses
}
```

#### 3.2 Implement CRUD Operations
- `getTransactions()` - Fetch all transactions
- `createTransaction()` - Add new transaction
- `deleteTransaction()` - Remove transaction
- `getMonthlyStats()` - Calculate monthly data for charts
- `getCategoryStats()` - Calculate category breakdown

---

### **Phase 4: Update Components** ⏱️ ~60 min

#### 4.1 Update Dashboard Component
**File**: `components/dashboard.tsx` (UPDATE)
- Remove `useState` for transactions
- Use Server Actions to fetch data
- Convert to Server Component or use `useEffect` for data fetching

#### 4.2 Update Add Transaction Dialog
**File**: `components/add-transaction-dialog.tsx` (UPDATE)
- Call `createTransaction` Server Action
- Add loading states and error handling
- Show success/error toasts

#### 4.3 Update Transaction List
**File**: `components/transaction-list.tsx` (UPDATE)
- Add delete functionality
- Call `deleteTransaction` Server Action

#### 4.4 Update Chart Components
**File**: `components/overview-chart.tsx` (UPDATE)
- Fetch monthly data from Server Action instead of `monthlyData`

**File**: `components/category-chart.tsx` (UPDATE)
- Already receives transactions as prop, no changes needed

---

### **Phase 5: Migrate Sample Data** ⏱️ ~15 min

#### 5.1 Create Seed Script
**File**: `prisma/seed.ts` (NEW)
```typescript
import { PrismaClient } from '@prisma/client'
import { sampleTransactions } from '../lib/data'

const prisma = new PrismaClient()

async function main() {
  // Map sample data to Prisma format
  // Insert into database
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

#### 5.2 Update package.json
Add seed script:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

#### 5.3 Run Seed
```bash
npm install -D tsx
npx prisma db seed
```

---

### **Phase 6: Cleanup & Optimization** ⏱️ ~20 min

#### 6.1 Remove Sample Data
- Keep `lib/data.ts` for category labels/icons only
- Remove `sampleTransactions` and `monthlyData`

#### 6.2 Add Error Handling
- Add try-catch blocks in Server Actions
- Add error boundaries in components
- Add loading states

#### 6.3 Add Optimistic Updates
- Use React `useOptimistic` hook for better UX
- Show immediate feedback before server confirmation

---

## 📁 New File Structure

```
income-expense-app/
├── app/
│   ├── actions/
│   │   └── transactions.ts          # NEW - Server Actions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── [existing components - updated]
├── lib/
│   ├── data.ts                       # UPDATE - Remove sample data
│   ├── prisma.ts                     # NEW - Prisma client
│   ├── types.ts                      # Keep as-is
│   └── utils.ts
├── prisma/
│   ├── schema.prisma                 # NEW - Database schema
│   └── seed.ts                        # NEW - Seed script
├── .env                               # UPDATE - Add DATABASE_URL
└── package.json                       # UPDATE - Add Prisma scripts
```

---

## 🔄 Migration Checklist

### Setup
- [ ] Install Prisma dependencies
- [ ] Initialize Prisma
- [ ] Create NeonDB database
- [ ] Configure DATABASE_URL in `.env`
- [ ] Create Prisma schema
- [ ] Generate Prisma client
- [ ] Push schema to database

### Backend
- [ ] Create Prisma client singleton (`lib/prisma.ts`)
- [ ] Create Server Actions file (`app/actions/transactions.ts`)
- [ ] Implement `getTransactions()` action
- [ ] Implement `createTransaction()` action
- [ ] Implement `deleteTransaction()` action
- [ ] Implement `getMonthlyStats()` action
- [ ] Implement `getCategoryStats()` action

### Frontend Updates
- [ ] Update `dashboard.tsx` to use Server Actions
- [ ] Update `add-transaction-dialog.tsx` to call Server Action
- [ ] Update `transaction-list.tsx` with delete functionality
- [ ] Update `overview-chart.tsx` to fetch from Server Action
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add optimistic updates

### Data Migration
- [ ] Create seed script
- [ ] Map sample data to Prisma format
- [ ] Run seed script
- [ ] Verify data in database

### Cleanup
- [ ] Remove `sampleTransactions` from `lib/data.ts`
- [ ] Remove `monthlyData` from `lib/data.ts`
- [ ] Keep category labels/icons in `lib/data.ts`
- [ ] Test all functionality
- [ ] Fix any TypeScript errors

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install @prisma/client
npm install -D prisma tsx

# 2. Initialize Prisma
npx prisma init

# 3. Update schema.prisma (see Phase 1.4)

# 4. Generate and push schema
npx prisma generate
npx prisma db push

# 5. Create seed script and run
npx prisma db seed

# 6. Start development
npm run dev
```

---

## 📝 Important Notes

### Database Schema Considerations
- **IDs**: Using `cuid()` for unique IDs (better than UUID for databases)
- **Dates**: Using `DateTime` instead of strings
- **Enums**: Using Prisma enums for type safety
- **Indexes**: Added indexes on `type`, `category`, and `date` for performance

### Server Actions vs API Routes
- **Server Actions** chosen for simplicity (no need for separate API routes)
- Can be called directly from client components
- Built-in type safety with TypeScript
- Automatic revalidation with `revalidatePath()`

### Category Mapping
- Map `"other-income"` → `otherIncome` (camelCase for Prisma)
- Map `"other-expense"` → `otherExpense` (camelCase for Prisma)
- Update category labels mapping accordingly

### Performance Optimizations
- Use `revalidatePath()` after mutations
- Consider adding pagination for large transaction lists
- Add database indexes for frequently queried fields
- Use `select` in Prisma queries to fetch only needed fields

---

## 🎯 Success Criteria

✅ All transactions persist in database  
✅ Can add new transactions  
✅ Can delete transactions  
✅ Charts display real data from database  
✅ Monthly stats calculated from database  
✅ Category breakdown works correctly  
✅ No TypeScript errors  
✅ App works in production build  

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NeonDB Documentation](https://neon.tech/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-nextjs)

---

**Estimated Total Time**: ~3-4 hours  
**Complexity**: Medium  
**Risk Level**: Low (can rollback easily)
