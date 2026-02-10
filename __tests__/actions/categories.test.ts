// Mock next/cache before importing the module
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

// Mock Prisma client
const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transaction: {
    count: jest.fn(),
  },
}

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

import {
  getCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/categories"

describe("getCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns all categories sorted", async () => {
    const mockCategories = [
      { id: "1", name: "food", label: "Food", icon: "🍔", type: "expense" },
      { id: "2", name: "salary", label: "Salary", icon: "💼", type: "income" },
    ]
    mockPrisma.category.findMany.mockResolvedValue(mockCategories)

    const result = await getCategories()
    expect(result).toEqual(mockCategories)
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      orderBy: [{ type: "asc" }, { label: "asc" }],
    })
  })

  it("throws on database error", async () => {
    mockPrisma.category.findMany.mockRejectedValue(new Error("DB error"))
    await expect(getCategories()).rejects.toThrow("Failed to fetch categories")
  })
})

describe("getCategoriesByType", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns categories filtered by type", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: "1", name: "food", label: "Food", icon: "🍔", type: "expense" },
    ])

    const result = await getCategoriesByType("expense")
    expect(result).toHaveLength(1)
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { type: "expense" },
      orderBy: { label: "asc" },
    })
  })
})

describe("createCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates a category successfully", async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null)
    mockPrisma.category.create.mockResolvedValue({ id: "new-1" })

    const result = await createCategory({
      name: "test",
      label: "Test",
      icon: "🎯",
      type: "expense",
    })

    expect(result.success).toBe(true)
  })

  it("returns error when name already exists", async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: "existing" })

    const result = await createCategory({
      name: "duplicate",
      label: "Duplicate",
      type: "expense",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("already exists")
    }
  })

  it("returns error for validation failure", async () => {
    const result = await createCategory({
      name: "",
      label: "",
      type: "expense",
    })

    expect(result.success).toBe(false)
  })

  it("handles empty icon as empty string", async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null)
    mockPrisma.category.create.mockResolvedValue({ id: "new-2" })

    await createCategory({
      name: "no-icon",
      label: "No Icon",
      type: "income",
    })

    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ icon: "" }),
    })
  })
})

describe("updateCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates a category successfully", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null)
    mockPrisma.category.update.mockResolvedValue({ id: "1" })

    const result = await updateCategory("1", {
      name: "updated",
      label: "Updated",
      icon: "✅",
      type: "expense",
    })

    expect(result.success).toBe(true)
  })

  it("returns error when another category has the same name", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ id: "other" })

    const result = await updateCategory("1", {
      name: "duplicate",
      label: "Duplicate",
      type: "expense",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("already exists")
    }
  })
})

describe("deleteCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes a category with no transactions", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0)
    mockPrisma.category.delete.mockResolvedValue({})

    const result = await deleteCategory("1")
    expect(result.success).toBe(true)
  })

  it("returns error when category has transactions", async () => {
    mockPrisma.transaction.count.mockResolvedValue(5)

    const result = await deleteCategory("1")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("5 transaction(s)")
    }
  })

  it("returns error on database failure", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0)
    mockPrisma.category.delete.mockRejectedValue(new Error("Delete failed"))

    const result = await deleteCategory("1")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Delete failed")
    }
  })
})
