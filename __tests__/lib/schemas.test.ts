import {
  createTransactionSchema,
  updateTransactionSchema,
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/schemas"

describe("createTransactionSchema", () => {
  const validData = {
    description: "Test transaction",
    amount: 100,
    type: "expense" as const,
    category: "food",
    categoryId: "abc-123",
    date: "2026-01-15",
  }

  it("accepts valid transaction data", () => {
    const result = createTransactionSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("accepts data without categoryId (optional)", () => {
    const { categoryId, ...data } = validData
    const result = createTransactionSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("rejects empty description", () => {
    const result = createTransactionSchema.safeParse({ ...validData, description: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Description is required")
    }
  })

  it("rejects description over 255 characters", () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      description: "a".repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative amount", () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: -50 })
    expect(result.success).toBe(false)
  })

  it("rejects zero amount", () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects invalid type", () => {
    const result = createTransactionSchema.safeParse({ ...validData, type: "transfer" })
    expect(result.success).toBe(false)
  })

  it("accepts income type", () => {
    const result = createTransactionSchema.safeParse({ ...validData, type: "income" })
    expect(result.success).toBe(true)
  })

  it("rejects empty date", () => {
    const result = createTransactionSchema.safeParse({ ...validData, date: "" })
    expect(result.success).toBe(false)
  })
})

describe("updateTransactionSchema", () => {
  it("validates the same as createTransactionSchema", () => {
    const validData = {
      description: "Updated",
      amount: 200,
      type: "income" as const,
      category: "salary",
      date: "2026-02-01",
    }
    const result = updateTransactionSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe("createCategorySchema", () => {
  const validData = {
    name: "test-category",
    label: "Test Category",
    icon: "🎯",
    type: "expense" as const,
  }

  it("accepts valid category data", () => {
    const result = createCategorySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("accepts data without icon (optional)", () => {
    const { icon, ...data } = validData
    const result = createCategorySchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = createCategorySchema.safeParse({ ...validData, name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name over 100 characters", () => {
    const result = createCategorySchema.safeParse({
      ...validData,
      name: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty label", () => {
    const result = createCategorySchema.safeParse({ ...validData, label: "" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid type", () => {
    const result = createCategorySchema.safeParse({ ...validData, type: "transfer" })
    expect(result.success).toBe(false)
  })

  it("rejects icon over 10 characters", () => {
    const result = createCategorySchema.safeParse({
      ...validData,
      icon: "a".repeat(11),
    })
    expect(result.success).toBe(false)
  })
})

describe("updateCategorySchema", () => {
  it("validates the same as createCategorySchema", () => {
    const validData = {
      name: "updated",
      label: "Updated",
      type: "income" as const,
    }
    const result = updateCategorySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
