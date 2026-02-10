export type TransactionType = "income" | "expense"

export type PaymentMode = "cash" | "gcash" | "bdo_savings" | "cbs_checking"

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
  paymentMode: PaymentMode
  category: Category
  date: string
}

export interface CategorySummary {
  category: Category
  amount: number
  percentage: number
}

export interface PaymentModeSummary {
  paymentMode: PaymentMode
  label: string
  totalIncome: number
  totalExpenses: number
  netFlow: number
  transactionCount: number
}
