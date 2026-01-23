import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { sampleTransactions, categoryLabels, categoryIcons } from '../lib/data'

// Create postgres connection
let connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Ensure connectionString is a string and remove any quotes/newlines
let connString = String(connectionString)
  .trim()
  .replace(/^['"]|['"]$/g, '') // Remove surrounding quotes
  .replace(/\n/g, '') // Remove newlines
  .replace(/\r/g, '') // Remove carriage returns

if (!connString) {
  throw new Error('DATABASE_URL environment variable is empty after processing')
}

// Validate it looks like a connection string
if (!connString.startsWith('postgresql://') && !connString.startsWith('postgres://')) {
  throw new Error(`DATABASE_URL does not appear to be a valid PostgreSQL connection string: ${connString.substring(0, 50)}...`)
}

// Initialize pg Pool connection - @prisma/adapter-pg works with pg library
const pool = new Pool({
  connectionString: connString,
  max: 1,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({
  adapter,
})

// Define initial categories
const initialCategories = [
  // Income categories
  { name: 'salary', label: 'Salary', icon: '💼', type: 'income' as const },
  { name: 'freelance', label: 'Freelance', icon: '💻', type: 'income' as const },
  { name: 'investments', label: 'Investments', icon: '📈', type: 'income' as const },
  { name: 'other-income', label: 'Other Income', icon: '💰', type: 'income' as const },
  // Expense categories
  { name: 'food', label: 'Food & Dining', icon: '🍔', type: 'expense' as const },
  { name: 'gas', label: 'Gas', icon: '⛽', type: 'expense' as const },
  { name: 'repair', label: 'Repair', icon: '🔧', type: 'expense' as const },
  { name: 'electricity', label: 'Electricity', icon: '⚡', type: 'expense' as const },
  { name: 'water', label: 'Water', icon: '💧', type: 'expense' as const },
  { name: 'internet', label: 'Internet', icon: '🌐', type: 'expense' as const },
  { name: 'phone', label: 'Phone', icon: '📱', type: 'expense' as const },
  { name: 'other-utilities', label: 'Other Utilities', icon: '🔌', type: 'expense' as const },
  { name: 'entertainment', label: 'Entertainment', icon: '🎬', type: 'expense' as const },
  { name: 'shopping', label: 'Shopping', icon: '🛍️', type: 'expense' as const },
  { name: 'health', label: 'Health', icon: '🏥', type: 'expense' as const },
  { name: 'other-expense', label: 'Other Expense', icon: '📦', type: 'expense' as const },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.transaction.deleteMany({})
  await prisma.category.deleteMany({})
  console.log('✅ Cleared existing data')

  // Create categories
  console.log(`📁 Creating ${initialCategories.length} categories...`)
  const categoryMap = new Map<string, string>()
  
  for (const cat of initialCategories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        label: cat.label,
        icon: cat.icon,
        type: cat.type,
      },
      create: {
        name: cat.name,
        label: cat.label,
        icon: cat.icon,
        type: cat.type,
      },
    })
    categoryMap.set(cat.name, category.id)
  }
  console.log('✅ Categories created')

  // Insert sample transactions
  console.log(`📝 Inserting ${sampleTransactions.length} transactions...`)
  
  for (const transaction of sampleTransactions) {
    // Map old category names to new ones
    let categoryName = transaction.category
    if (categoryName === 'utilities') {
      categoryName = 'electricity'
    } else if (categoryName === 'transport') {
      categoryName = 'gas'
    }

    const categoryId = categoryMap.get(categoryName)
    if (!categoryId) {
      console.warn(`⚠️  Category "${categoryName}" not found, skipping transaction: ${transaction.description}`)
      continue
    }

    await prisma.transaction.create({
      data: {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        categoryId,
        date: new Date(transaction.date),
      },
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
