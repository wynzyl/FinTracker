"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import type { Transaction, PaymentMode } from "@/lib/types"
import { paymentModeLabels } from "@/lib/types"
import { Banknote, Smartphone, Landmark, BookCheck, type LucideIcon } from "lucide-react"

const paymentModeIcons: Record<PaymentMode, { icon: LucideIcon; color: string; bg: string }> = {
  cash: { icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  gcash: { icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10" },
  bdo_savings: { icon: Landmark, color: "text-amber-500", bg: "bg-amber-500/10" },
  cbs_checking: { icon: BookCheck, color: "text-violet-500", bg: "bg-violet-500/10" },
}

interface PaymentModeChartProps {
  transactions: Transaction[]
}

export function PaymentModeChart({ transactions }: PaymentModeChartProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const stats = (Object.keys(paymentModeLabels) as PaymentMode[]).map((mode) => {
    const income = transactions
      .filter((t) => t.type === "income" && (t.paymentMode || "cash") === mode)
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "expense" && (t.paymentMode || "cash") === mode)
      .reduce((sum, t) => sum + t.amount, 0)
    const balance = income - expenses
    const incomePercent = totalIncome > 0 ? (income / totalIncome) * 100 : 0
    const expensePercent = totalExpenses > 0 ? (expenses / totalExpenses) * 100 : 0
    return { mode, income, expenses, balance, incomePercent, expensePercent }
  }).filter((s) => s.income > 0 || s.expenses > 0)

  const fmt = formatCurrency

  return (
    <>
      {stats.map((s) => (
        <Card key={s.mode} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {(() => { const { icon: Icon, color, bg } = paymentModeIcons[s.mode]; return <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}><Icon className={cn("h-4 w-4", color)} /></div>; })()}
              <p className="text-sm font-medium text-muted-foreground">{paymentModeLabels[s.mode]}</p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Income</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-success">{fmt(s.income)}</span>
                  <span className="text-xs text-muted-foreground">({s.incomePercent.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-destructive">{fmt(s.expenses)}</span>
                  <span className="text-xs text-muted-foreground">({s.expensePercent.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span
                  className={cn(
                    "text-lg font-semibold",
                    s.balance >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {fmt(s.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
