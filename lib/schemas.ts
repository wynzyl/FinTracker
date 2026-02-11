import { z } from "zod"

export const createTransactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(255, "Description must be 255 characters or less"),
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(["income", "expense"], { message: "Type must be 'income' or 'expense'" }),
  category: z.string(),
  categoryId: z.string().min(1, "Category is required").optional(),
  date: z.string().min(1, "Date is required"),
  paymentMode: z.enum(["cash", "gcash", "bdo_savings", "cbs_checking"], { message: "Payment mode is required" }),
})

export const updateTransactionSchema = createTransactionSchema

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  label: z.string().min(1, "Label is required").max(100, "Label must be 100 characters or less"),
  icon: z.string().max(10, "Icon must be 10 characters or less").optional().nullable(),
  type: z.enum(["income", "expense"], { message: "Type must be 'income' or 'expense'" }),
})

export const updateCategorySchema = createCategorySchema
