"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categoryLabels } from "@/lib/data"
import type { Transaction } from "@/lib/types"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface CategoryChartProps {
  transactions: Transaction[]
}

const COLORS = [
  "oklch(0.7 0.18 145)",
  "oklch(0.55 0.2 250)",
  "oklch(0.75 0.15 80)",
  "oklch(0.65 0.2 25)",
  "oklch(0.6 0.15 300)",
  "oklch(0.65 0.12 180)",
]

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense")
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const categoryData = expenseTransactions.reduce(
    (acc, transaction) => {
      const existing = acc.find((item) => item.category === transaction.category)
      if (existing) {
        existing.amount += transaction.amount
      } else {
        acc.push({
          category: transaction.category,
          amount: transaction.amount,
          name: categoryLabels[transaction.category],
        })
      }
      return acc
    },
    [] as { category: string; amount: number; name: string }[]
  )

  const chartData = categoryData
    .map((item) => ({
      ...item,
      percentage: ((item.amount / totalExpenses) * 100).toFixed(1),
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.005 260)",
                    border: "1px solid oklch(0.25 0.005 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString("en-US", { minimumFractionDigits: 2 }),
                    "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {chartData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
