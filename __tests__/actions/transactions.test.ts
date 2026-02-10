// Mock next/cache before importing the module
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

// Mock Prisma client
const mockPrisma = {
  transaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
  getTotalExpensesFromDB,
} from "@/app/actions/transactions"

describe("getTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns mapped transactions with category info", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: "1",
        description: "Test",
        amount: 100,
        type: "expense",
        categoryId: "cat-1",
        date: new Date("2026-01-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { name: "food", label: "Food & Dining", icon: "🍔", type: "expense" },
      },
    ])

    const result = await getTransactions()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: "1",
      description: "Test",
      amount: 100,
      type: "expense",
      category: "food",
      categoryId: "cat-1",
      categoryLabel: "Food & Dining",
      categoryIcon: "🍔",
      date: "2026-01-15",
    })
  })

  it("handles missing category gracefully", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: "2",
        description: "No Category",
        amount: 50,
        type: "income",
        categoryId: "cat-2",
        date: new Date("2026-01-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
      },
    ])

    const result = await getTransactions()
    expect(result[0].category).toBe("other-expense")
    expect(result[0].categoryLabel).toBe("other-expense")
    expect(result[0].categoryIcon).toBeNull()
  })

  it("throws on database error", async () => {
    mockPrisma.transaction.findMany.mockRejectedValue(new Error("DB error"))
    await expect(getTransactions()).rejects.toThrow("Failed to fetch transactions")
  })
})

describe("createTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates a transaction with categoryId", async () => {
    mockPrisma.transaction.create.mockResolvedValue({ id: "new-1" })

    const result = await createTransaction({
      description: "New transaction",
      amount: 50,
      type: "expense",
      category: "food",
      categoryId: "cat-1",
      date: "2026-01-20",
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
      data: {
        description: "New transaction",
        amount: 50,
        type: "expense",
        categoryId: "cat-1",
        date: new Date("2026-01-20"),
      },
    })
  })

  it("looks up category by name when categoryId not provided", async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: "cat-found" })
    mockPrisma.transaction.create.mockResolvedValue({ id: "new-2" })

    const result = await createTransaction({
      description: "By name",
      amount: 75,
      type: "income",
      category: "salary",
      date: "2026-01-20",
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
      where: { name: "salary" },
    })
  })

  it("returns error for validation failure", async () => {
    const result = await createTransaction({
      description: "",
      amount: -10,
      type: "expense",
      category: "food",
      date: "2026-01-20",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it("returns error when category not found", async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null)
    mockPrisma.category.findMany.mockResolvedValue([])

    const result = await createTransaction({
      description: "Orphan",
      amount: 10,
      type: "expense",
      category: "nonexistent",
      date: "2026-01-20",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("not found")
    }
  })

  it("returns error on database failure", async () => {
    mockPrisma.transaction.create.mockRejectedValue(new Error("DB write error"))

    const result = await createTransaction({
      description: "Will fail",
      amount: 10,
      type: "expense",
      category: "food",
      categoryId: "cat-1",
      date: "2026-01-20",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("DB write error")
    }
  })
})

describe("updateTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates a transaction successfully", async () => {
    mockPrisma.transaction.update.mockResolvedValue({ id: "1" })

    const result = await updateTransaction("1", {
      description: "Updated",
      amount: 200,
      type: "income",
      category: "salary",
      categoryId: "cat-1",
      date: "2026-02-01",
    })

    expect(result.success).toBe(true)
  })

  it("returns error for validation failure", async () => {
    const result = await updateTransaction("1", {
      description: "",
      amount: 0,
      type: "expense",
      category: "food",
      date: "2026-01-20",
    })

    expect(result.success).toBe(false)
  })
})

describe("deleteTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes a transaction successfully", async () => {
    mockPrisma.transaction.delete.mockResolvedValue({})

    const result = await deleteTransaction("1")
    expect(result.success).toBe(true)
    expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    })
  })

  it("returns error on database failure", async () => {
    mockPrisma.transaction.delete.mockRejectedValue(new Error("Not found"))

    const result = await deleteTransaction("nonexistent")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Not found")
    }
  })
})

describe("getTotalExpensesFromDB", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns aggregated expenses", async () => {
    mockPrisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 500 },
      _count: { id: 5 },
    })

    const result = await getTotalExpensesFromDB()
    expect(result).toEqual({ total: 500, count: 5 })
  })

  it("returns zero when no expenses", async () => {
    mockPrisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: null },
      _count: { id: 0 },
    })

    const result = await getTotalExpensesFromDB()
    expect(result).toEqual({ total: 0, count: 0 })
  })
})
