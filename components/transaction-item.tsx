"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { categoryLabels, categoryIcons } from "@/lib/data"
import { paymentModeLabels } from "@/lib/types"
import type { Transaction } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight, Trash2, Edit } from "lucide-react"

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  showYear?: boolean
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isDeleting,
  showYear = false,
}: TransactionItemProps) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    ...(showYear && { year: "numeric" }),
  }

  return (
    <div
      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-secondary/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
          {transaction.categoryIcon || categoryIcons[transaction.category] || "📋"}
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.categoryLabel || categoryLabels[transaction.category] || transaction.category} •{" "}
            {paymentModeLabels[transaction.paymentMode] || transaction.paymentMode} •{" "}
            {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", dateOptions)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-1 font-semibold",
            transaction.type === "income" ? "text-success" : "text-destructive"
          )}
        >
          {transaction.type === "income" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-secondary"
            onClick={() => onEdit(transaction)}
            title="Edit transaction"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(transaction.id)}
            disabled={isDeleting}
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
