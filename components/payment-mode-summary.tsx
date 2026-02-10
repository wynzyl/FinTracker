"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { paymentModeLabels, paymentModeIcons } from "@/lib/data"
import type { PaymentModeSummary as PaymentModeSummaryType, PaymentMode } from "@/lib/types"

interface PaymentModeSummaryProps {
  data: PaymentModeSummaryType[]
  selectedMode: PaymentMode | "all"
  onModeSelect: (mode: PaymentMode | "all") => void
}

export function PaymentModeSummary({ data, selectedMode, onModeSelect }: PaymentModeSummaryProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Cash Flow by Payment Mode</CardTitle>
        {selectedMode !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => onModeSelect("all")}>
            Show All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => (
            <button
              key={item.paymentMode}
              onClick={() =>
                onModeSelect(selectedMode === item.paymentMode ? "all" : item.paymentMode)
              }
              className={cn(
                "rounded-lg border p-4 text-left transition-all hover:bg-secondary/50",
                selectedMode === item.paymentMode
                  ? "border-primary bg-secondary/80 ring-1 ring-primary"
                  : "border-border/50"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{paymentModeIcons[item.paymentMode]}</span>
                <span className="text-sm font-medium">{paymentModeLabels[item.paymentMode]}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Income</span>
                  <span className="text-success">
                    +{item.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Expenses</span>
                  <span className="text-destructive">
                    -{item.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-1 text-sm font-semibold">
                  <span>Net</span>
                  <span className={item.netFlow >= 0 ? "text-success" : "text-destructive"}>
                    {item.netFlow >= 0 ? "+" : ""}
                    {item.netFlow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.transactionCount} transaction{item.transactionCount !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
