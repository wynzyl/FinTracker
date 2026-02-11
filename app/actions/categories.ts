'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { TransactionType, ActionResult } from '@/lib/types'
import { createCategorySchema, updateCategorySchema } from '@/lib/schemas'

export interface CategoryData {
  id?: string
  name: string
  label: string
  icon?: string | null
  type: TransactionType
}

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { type: 'asc' },
        { label: 'asc' },
      ],
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(type: TransactionType) {
  try {
    const categories = await prisma.category.findMany({
      where: { type },
      orderBy: { label: 'asc' },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories by type:', error)
    throw new Error('Failed to fetch categories')
  }
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    })
    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    throw new Error('Failed to fetch category')
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: Omit<CategoryData, 'id'>): Promise<ActionResult<{ id: string }>> {
  const parsed = createCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    // Check if category name already exists
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    })

    if (existing) {
      return { success: false, error: 'Category with this name already exists' }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        label: data.label,
        type: data.type,
        icon: data.icon && data.icon.trim() !== '' ? data.icon : '',
      },
    })

    revalidatePath('/')
    return { success: true, data: { id: category.id } }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create category' }
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, data: Omit<CategoryData, 'id'>): Promise<ActionResult<{ id: string }>> {
  const parsed = updateCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    // Check if another category with the same name exists
    const existing = await prisma.category.findFirst({
      where: {
        name: data.name,
        NOT: { id },
      },
    })

    if (existing) {
      return { success: false, error: 'Category with this name already exists' }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        label: data.label,
        type: data.type,
        icon: data.icon && data.icon.trim() !== '' ? data.icon : '',
      },
    })

    revalidatePath('/')
    return { success: true, data: { id: category.id } }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update category' }
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    // Check if category is used in any transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    })

    if (transactionCount > 0) {
      return { success: false, error: `Cannot delete category: it is used in ${transactionCount} transaction(s)` }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete category' }
  }
}
