"use client"

import { useEffect, useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { cn } from "@/lib/utils"
import { categoryLabels, categoryIcons } from "@/lib/data"
import { paymentModeLabels } from "@/lib/types"
import type { Transaction } from "@/lib/types"
import { getTransactions, deleteTransaction } from "@/app/actions/transactions"
import { getCategories } from "@/app/actions/categories"
import {
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit,
  CalendarIcon,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { isToday, isThisWeek, startOfDay, endOfDay, format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface CategoryItem {
  id: string
  name: string
  label: string
  icon: string | null
  type: string
}

interface TransactionFilters {
  type: "all" | "income" | "expense"
  categoryId: string
  paymentMode: string
  datePreset: "all" | "today" | "this-week" | "custom"
  dateRange: DateRange | undefined
}

const defaultFilters: TransactionFilters = {
  type: "all",
  categoryId: "all",
  paymentMode: "all",
  datePreset: "all",
  dateRange: undefined,
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, categoriesData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ])
      setTransactions(transactionsData)
      setCategories(categoriesData as CategoryItem[])
    } catch (err) {
      console.error("Error loading data:", err)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ])
      setTransactions(transactionsData)
      setCategories(categoriesData as CategoryItem[])
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    setDeletingId(transactionToDelete)
    try {
      const result = await deleteTransaction(transactionToDelete)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Transaction deleted successfully")
      await handleRefresh()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  // Filter categories based on selected type
  const filteredCategories = useMemo(() => {
    if (filters.type === "all") return categories
    return categories.filter((cat) => cat.type === filters.type)
  }, [categories, filters.type])

  // Apply all filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false
      if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false
      if (filters.paymentMode !== "all" && t.paymentMode !== filters.paymentMode) return false

      const txDate = new Date(t.date + "T00:00:00")
      if (filters.datePreset === "today") {
        if (!isToday(txDate)) return false
      } else if (filters.datePreset === "this-week") {
        if (!isThisWeek(txDate, { weekStartsOn: 1 })) return false
      } else if (filters.datePreset === "custom" && filters.dateRange?.from) {
        if (txDate < startOfDay(filters.dateRange.from)) return false
        if (filters.dateRange.to && txDate > endOfDay(filters.dateRange.to)) return false
      }

      return true
    })
  }, [transactions, filters])

  // Sort filtered transactions by date descending
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date + "T00:00:00").getTime()
      const dateB = new Date(b.date + "T00:00:00").getTime()
      if (dateB !== dateA) return dateB - dateA
      return b.id.localeCompare(a.id)
    })
  }, [filteredTransactions])

  // Compute totals from filtered transactions
  const totalIncome = sortedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = sortedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const netTotal = totalIncome - totalExpense

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.categoryId !== "all" ||
    filters.paymentMode !== "all" ||
    filters.datePreset !== "all"

  const clearAllFilters = () => setFilters(defaultFilters)

  const handleDatePresetChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      datePreset: value as TransactionFilters["datePreset"],
      dateRange: value === "custom" ? prev.dateRange : undefined,
    }))
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Pick a date range"
    if (!range.to) return format(range.from, "MMM d, yyyy")
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onTransactionAdded={handleRefresh} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-secondary" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onTransactionAdded={handleRefresh} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">All Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Showing {sortedTransactions.length} of {transactions.length} transactions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <Tabs
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: value as TransactionFilters["type"],
                    categoryId: "all",
                  }))
                }
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Category Filter */}
              <Select
                value={filters.categoryId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon || ""} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Mode Filter */}
              <Select
                value={filters.paymentMode}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, paymentMode: value }))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Payment Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Modes</SelectItem>
                  {Object.entries(paymentModeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Preset Filter */}
              <Select value={filters.datePreset} onValueChange={handleDatePresetChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="custom">Date Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              {filters.datePreset === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDateRange(filters.dateRange)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={filters.dateRange}
                      onSelect={(range) =>
                        setFilters((prev) => ({ ...prev, dateRange: range }))
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="space-y-1 px-6 py-6">
              {sortedTransactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {hasActiveFilters
                    ? "No transactions match your filters."
                    : "No transactions found. Add your first transaction to get started!"}
                </div>
              ) : (
                sortedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                        {transaction.categoryIcon ||
                          categoryIcons[transaction.category] ||
                          "📋"}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.categoryLabel ||
                            categoryLabels[transaction.category] ||
                            transaction.category}{" "}
                          •{" "}
                          {paymentModeLabels[transaction.paymentMode] ||
                            transaction.paymentMode}{" "}
                          •{" "}
                          {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center gap-1 font-semibold",
                          transaction.type === "income"
                            ? "text-success"
                            : "text-destructive"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-secondary"
                          onClick={() => setEditingTransaction(transaction)}
                          title="Edit transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(transaction.id)}
                          disabled={deletingId === transaction.id}
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Totals Footer */}
          {sortedTransactions.length > 0 && (
            <div className="border-t border-border/50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-end gap-6">
                <div className="text-sm">
                  <span className="text-muted-foreground">Income: </span>
                  <span className="font-semibold text-success">
                    +{totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Expenses: </span>
                  <span className="font-semibold text-destructive">
                    -{totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Net Total: </span>
                  <span className={cn("font-semibold", netTotal >= 0 ? "text-success" : "text-destructive")}>
                    {netTotal >= 0 ? "+" : "-"}
                    {Math.abs(netTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null)
          }}
          onTransactionUpdated={() => {
            setEditingTransaction(null)
            handleRefresh()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
