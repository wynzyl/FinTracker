"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { OverviewChart } from "@/components/overview-chart"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { getTransactions, getMonthlyStats, getTotalExpensesFromDB } from "@/app/actions/transactions"
import type { Transaction } from "@/lib/types"

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expenses: number }[]>([])
  const [dbTotalExpenses, setDbTotalExpenses] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, monthlyStats, dbTotalExpenses] = await Promise.all([
        getTransactions(),
        getMonthlyStats(),
        getTotalExpensesFromDB(),
      ])
      console.log('Loaded transactions:', transactionsData.length)
      console.log('Income transactions:', transactionsData.filter(t => t.type === 'income').length)
      console.log('Expense transactions:', transactionsData.filter(t => t.type === 'expense').length)
      console.log('DB Total Expenses (from aggregate):', dbTotalExpenses.total, 'Count:', dbTotalExpenses.count)
      setTransactions(transactionsData)
      setMonthlyData(monthlyStats)
      setDbTotalExpenses(dbTotalExpenses.total)
    } catch (error) {
      console.error('Error loading data:', error)
      // Set empty arrays on error to prevent UI issues
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
      console.log('Refreshed transactions:', transactionsData.length)
      console.log('Income transactions:', transactionsData.filter(t => t.type === 'income').length)
      console.log('Expense transactions:', transactionsData.filter(t => t.type === 'expense').length)
      console.log('DB Total Expenses (from aggregate):', dbTotalExpenses.total, 'Count:', dbTotalExpenses.count)
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

  // Calculate totals - ensure we include ALL transactions
  const incomeTransactions = transactions.filter((t) => {
    const isIncome = t.type === "income" || t.type === "INCOME"
    if (!isIncome && t.type !== "expense" && t.type !== "EXPENSE") {
      console.warn('Unknown transaction type:', t.type, t)
    }
    return isIncome
  })
  
  const expenseTransactions = transactions.filter((t) => {
    const isExpense = t.type === "expense" || t.type === "EXPENSE"
    return isExpense
  })

  // Calculate totals with proper number handling
  const totalIncome = incomeTransactions.reduce((sum, t) => {
    const amount = Number(t.amount) || 0
    return sum + amount
  }, 0)

  // Use database aggregate total as source of truth, fallback to calculated sum
  const calculatedExpenses = expenseTransactions.reduce((sum, t) => {
    const amount = Number(t.amount) || 0
    return sum + amount
  }, 0)
  
  // Use DB total if available and different (more accurate), otherwise use calculated
  const totalExpenses = dbTotalExpenses > 0 ? dbTotalExpenses : calculatedExpenses
  
  // Debug: Log detailed transaction information (moved to useEffect to avoid render issues)
  useEffect(() => {
    if (transactions.length > 0) {
      const incomeTxns = transactions.filter((t) => t.type === "income" || t.type === "INCOME")
      const expenseTxns = transactions.filter((t) => t.type === "expense" || t.type === "EXPENSE")
      
      console.log('=== TRANSACTION TOTALS DEBUG ===')
      console.log('Total transactions:', transactions.length)
      console.log('Income transactions:', incomeTxns.length)
      console.log('Expense transactions:', expenseTxns.length)
      
      const calculatedIncome = incomeTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      const calculatedExpenses = expenseTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      
      console.log('Total income:', calculatedIncome)
      console.log('Total expenses (calculated):', calculatedExpenses)
      console.log('Total expenses (DB aggregate):', dbTotalExpenses)
      
      // Log all expense transactions with their amounts
      console.log('=== ALL EXPENSE TRANSACTIONS ===')
      expenseTxns.forEach((t, index) => {
        console.log(`${index + 1}. ${t.description}: ${t.amount} (type: ${t.type})`)
      })
      
      console.log('Difference:', Math.abs(calculatedExpenses - dbTotalExpenses))
      if (Math.abs(calculatedExpenses - dbTotalExpenses) > 0.01) {
        console.warn('⚠️ DISCREPANCY DETECTED! Client sum:', calculatedExpenses, 'DB sum:', dbTotalExpenses)
      }
      console.log('================================')
    }
  }, [transactions, dbTotalExpenses])

  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  // Calculate changes (mock data for demo - can be enhanced later)
  const incomeChange = 8.2
  const expenseChange = -12.5
  const balanceChange = 15.3

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
