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
import { TransactionItem } from "@/components/transaction-item"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { useDeleteConfirm } from "@/hooks/use-delete-confirm"
import { cn, formatCurrency } from "@/lib/utils"
import { paymentModeLabels } from "@/lib/types"
import type { Transaction } from "@/lib/types"
import { getTransactions, deleteTransaction } from "@/app/actions/transactions"
import { getCategories } from "@/app/actions/categories"
import { TransactionReportDialog } from "@/components/transaction-report-dialog"
import { CalendarIcon, FileText, X } from "lucide-react"
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

/**
 * Page component that displays and manages a filtered and sorted list of financial transactions with aggregate totals and dialogs for editing and deleting.
 *
 * Provides controls for filtering by type, category, payment mode, and date (including custom range), shows transactions ordered newest-first, displays income/expense/net totals, and exposes UI for refreshing, editing, and deleting transactions. Loads transactions and categories on mount and refreshes data after edits or deletions; shows a loading state and user-facing error toasts.
 *
 * @returns The transactions page UI as a React element
 */
export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

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

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingId,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useDeleteConfirm({
    onDelete: deleteTransaction,
    onSuccess: handleRefresh,
    successMessage: "Transaction deleted successfully",
    errorMessage: "Failed to delete transaction",
  })

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
        {/* Title + Export */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">All Transactions</h2>
            <p className="text-sm text-muted-foreground">
              Showing {sortedTransactions.length} of {transactions.length} transactions
            </p>
          </div>

          {sortedTransactions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              View Report
            </Button>
          )}
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
                <SelectTrigger className="w-45">
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
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-37.5">
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
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={setEditingTransaction}
                    onDelete={handleDeleteClick}
                    isDeleting={deletingId === transaction.id}
                    showYear
                  />
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
                    +{formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Expenses: </span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(totalExpense)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Net Total: </span>
                  <span className={cn("font-semibold", netTotal >= 0 ? "text-success" : "text-destructive")}>
                    {netTotal >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(netTotal))}
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

      {/* Report Preview Dialog */}
      <TransactionReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        transactions={sortedTransactions}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netTotal={netTotal}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  )
}