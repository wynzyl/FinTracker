export type TransactionType = "income" | "expense"

export type Category =
  | "salary"
  | "freelance"
  | "investments"
  | "other-income"
  | "food"
  | "gas"
  | "repair"
  | "electricity"
  | "water"
  | "internet"
  | "phone"
  | "other-utilities"
  | "entertainment"
  | "shopping"
  | "health"
  | "other-expense"

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: Category
  categoryId: string
  categoryLabel: string
  categoryIcon: string | null
  date: string
}

export interface CategorySummary {
  category: Category
  amount: number
  percentage: number
}
