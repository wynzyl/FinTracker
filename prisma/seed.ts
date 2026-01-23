import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { sampleTransactions } from '../lib/data'

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

// Map frontend category format (kebab-case) to Prisma enum format (camelCase)
function mapCategoryToPrisma(category: string): string {
  const categoryMap: Record<string, string> = {
    'salary': 'salary',
    'freelance': 'freelance',
    'investments': 'investments',
    'other-income': 'otherIncome',
    'food': 'food',
    'gas': 'gas',
    'repair': 'repair',
    'electricity': 'electricity',
    'water': 'water',
    'internet': 'internet',
    'phone': 'phone',
    'other-utilities': 'otherUtilities',
    'transport': 'gas', // Map old transport to gas
    'utilities': 'electricity', // Map old utilities to electricity
    'entertainment': 'entertainment',
    'shopping': 'shopping',
    'health': 'health',
    'other-expense': 'otherExpense',
  }
  return categoryMap[category] || 'otherExpense'
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing transactions (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing transactions...')
  await prisma.transaction.deleteMany({})
  console.log('✅ Cleared existing transactions')

  // Insert sample transactions
  console.log(`📝 Inserting ${sampleTransactions.length} transactions...`)
  
  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: mapCategoryToPrisma(transaction.category),
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
