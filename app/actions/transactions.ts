'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Transaction, Category, TransactionType } from '@/lib/types'

// Map frontend category format (kebab-case) to Prisma enum format (camelCase)
function mapCategoryToPrisma(category: Category): string {
  const categoryMap: Record<Category, string> = {
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
    'entertainment': 'entertainment',
    'shopping': 'shopping',
    'health': 'health',
    'other-expense': 'otherExpense',
  }
  return categoryMap[category]
}

// Map Prisma enum format (camelCase) to frontend category format (kebab-case)
function mapCategoryFromPrisma(category: string): Category {
  const categoryMap: Record<string, Category> = {
    'salary': 'salary',
    'freelance': 'freelance',
    'investments': 'investments',
    'otherIncome': 'other-income',
    'food': 'food',
    'gas': 'gas',
    'repair': 'repair',
    'electricity': 'electricity',
    'water': 'water',
    'internet': 'internet',
    'phone': 'phone',
    'otherUtilities': 'other-utilities',
    'entertainment': 'entertainment',
    'shopping': 'shopping',
    'health': 'health',
    'otherExpense': 'other-expense',
  }
  return categoryMap[category] || 'other-expense'
}

/**
 * Fetch all transactions from the database
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    })

    return transactions.map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type as TransactionType,
      category: mapCategoryFromPrisma(t.category) as Category,
      date: t.date.toISOString().split('T')[0], // Convert DateTime to YYYY-MM-DD string
    }))
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw new Error('Failed to fetch transactions')
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: Omit<Transaction, 'id'>) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: mapCategoryToPrisma(data.category) as any,
        date: new Date(data.date),
      },
    })

    revalidatePath('/')
    return { success: true, transaction }
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw new Error('Failed to create transaction')
  }
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw new Error('Failed to delete transaction')
  }
}

/**
 * Get monthly statistics for the overview chart
 * Returns data for the last 6 months
 */
export async function getMonthlyStats() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    })

    // Group transactions by month
    const monthlyMap = new Map<string, { income: number; expenses: number }>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 })
      }

      const monthData = monthlyMap.get(monthKey)!
      if (transaction.type === 'income') {
        monthData.income += transaction.amount
      } else {
        monthData.expenses += transaction.amount
      }
    })

    // Convert to array and sort by date (most recent first)
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income: data.income,
        expenses: data.expenses,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 1, ' + new Date().getFullYear())
        const dateB = new Date(b.month + ' 1, ' + new Date().getFullYear())
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 6) // Get last 6 months
      .reverse() // Reverse to show oldest to newest

    return monthlyData
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    throw new Error('Failed to fetch monthly statistics')
  }
}

/**
 * Get category statistics for the category chart
 */
export async function getCategoryStats() {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'expense',
      },
    })

    const categoryMap = new Map<string, number>()

    transactions.forEach((transaction) => {
      const category = mapCategoryFromPrisma(transaction.category)
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + transaction.amount)
    })

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0)

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category: category as Category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
  } catch (error) {
    console.error('Error fetching category stats:', error)
    throw new Error('Failed to fetch category statistics')
  }
}
