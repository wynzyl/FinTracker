import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient() {
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

  return new PrismaClient({
    adapter,
  })
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma