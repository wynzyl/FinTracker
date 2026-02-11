'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Transaction, Category, TransactionType, ActionResult } from '@/lib/types'
import { createTransactionSchema, updateTransactionSchema } from '@/lib/schemas'

/**
 * Fetch all transactions from the database
 * Returns transactions with category information
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: [
        {
          date: 'desc', // Most recent date first
        },
        {
          createdAt: 'desc', // If dates are the same, most recently created first
        },
      ],
    })

    // Map transactions and handle any missing categories gracefully
    return transactions.map((t) => {
      // Ensure category exists, use fallback if not
      const categoryName = t.category?.name || 'other-expense'
      const categoryLabel = t.category?.label || categoryName
      const categoryIcon = t.category?.icon || null

      return {
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type as TransactionType,
        category: categoryName as Category,
        categoryId: t.categoryId,
        categoryLabel,
        categoryIcon,
        date: t.date.toISOString().split('T')[0],
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw new Error('Failed to fetch transactions')
  }
}

/**
 * Create a new transaction
 * Accepts either categoryId or category name (for backward compatibility)
 */
export async function createTransaction(data: Omit<Transaction, 'id' | 'categoryId' | 'categoryLabel' | 'categoryIcon'> & { categoryId?: string }): Promise<ActionResult<{ id: string }>> {
  const parsed = createTransactionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    let categoryId: string

    // If categoryId is provided, use it; otherwise find category by name
    if (data.categoryId) {
      categoryId = data.categoryId
    } else {
      // Find category by name (for backward compatibility)
      // Try exact match first, then case-insensitive search
      let category = await prisma.category.findUnique({
        where: { name: data.category },
      })

      // If not found, try case-insensitive search
      if (!category) {
        const allCategories = await prisma.category.findMany()
        category = allCategories.find(
          (cat) => cat.name.toLowerCase() === data.category.toLowerCase()
        ) || null
      }

      if (!category) {
        return { success: false, error: `Category "${data.category}" not found` }
      }

      categoryId = category.id
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryId,
        date: new Date(data.date),
      },
    })

    revalidatePath('/')
    return { success: true, data: { id: transaction.id } }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create transaction' }
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  data: Omit<Transaction, 'id' | 'categoryId' | 'categoryLabel' | 'categoryIcon'> & { categoryId?: string }
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTransactionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    let categoryId: string

    // If categoryId is provided, use it; otherwise find category by name
    if (data.categoryId) {
      categoryId = data.categoryId
    } else {
      // Find category by name (for backward compatibility)
      let category = await prisma.category.findUnique({
        where: { name: data.category },
      })

      // If not found, try case-insensitive search
      if (!category) {
        const allCategories = await prisma.category.findMany()
        category = allCategories.find(
          (cat) => cat.name.toLowerCase() === data.category.toLowerCase()
        ) || null
      }

      if (!category) {
        return { success: false, error: `Category "${data.category}" not found` }
      }

      categoryId = category.id
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryId,
        date: new Date(data.date),
      },
    })

    revalidatePath('/')
    return { success: true, data: { id: transaction.id } }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update transaction' }
  }
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    await prisma.transaction.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete transaction' }
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
 * Get total expenses directly from database (for verification)
 */
export async function getTotalExpensesFromDB() {
  try {
    const result = await prisma.transaction.aggregate({
      where: {
        type: 'expense',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    return {
      total: result._sum.amount || 0,
      count: result._count.id || 0,
    }
  } catch (error) {
    console.error('Error calculating total expenses from DB:', error)
    throw new Error('Failed to calculate total expenses')
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
      include: {
        category: true,
      },
    })

    const categoryMap = new Map<string, number>()

    transactions.forEach((transaction) => {
      const categoryName = transaction.category?.name || 'other-expense'
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + transaction.amount)
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
