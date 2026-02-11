"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { OverviewChart } from "@/components/overview-chart"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { getTransactions, getMonthlyStats, getTotalExpensesFromDB } from "@/app/actions/transactions"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import type { Transaction } from "@/lib/types"

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expenses: number }[]>([])
  const [dbTotalExpenses, setDbTotalExpenses] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [transactionsData, monthlyStats, dbTotalExpenses] = await Promise.all([
        getTransactions(),
        getMonthlyStats(),
        getTotalExpensesFromDB(),
      ])
      setTransactions(transactionsData)
      setMonthlyData(monthlyStats)
      setDbTotalExpenses(dbTotalExpenses.total)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      setTransactions([])
      setMonthlyData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    try {
      // Refresh data without showing full loading screen
      const [transactionsData, monthlyStats, dbTotalExpenses] = await Promise.all([
        getTransactions(),
        getMonthlyStats(),
        getTotalExpensesFromDB(),
      ])
      setTransactions(transactionsData)
      setMonthlyData(monthlyStats)
      setDbTotalExpenses(dbTotalExpenses.total)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleDeleteTransaction = async () => {
    await handleRefresh()
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const calculatedExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Use DB aggregate total as source of truth, fallback to calculated sum
  const totalExpenses = dbTotalExpenses > 0 ? dbTotalExpenses : calculatedExpenses

  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  // Calculate changes (mock data for demo - can be enhanced later)
  const incomeChange = 8.2
  const expenseChange = -12.5
  const balanceChange = 15.3

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={loadData}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onTransactionAdded={handleRefresh} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            change={balanceChange}
          />
          <StatCard
            title="Total Income"
            value={totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            change={incomeChange}
            variant="income"
          />
          <StatCard
            title="Total Expenses"
            value={totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            change={expenseChange}
            variant="expense"
          />
          <StatCard
            title="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            change={5.2}
          />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <OverviewChart data={monthlyData} />
          <CategoryChart transactions={transactions} />
        </div>

        {/* Transaction List */}
        <div className="mt-8">
          <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
        </div>
      </main>
    </div>
  )
}
