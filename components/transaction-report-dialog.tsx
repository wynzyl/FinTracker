"use client"

import { useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency } from "@/lib/utils"
import { paymentModeLabels } from "@/lib/types"
import type { Transaction, PaymentMode } from "@/lib/types"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"
import { FileSpreadsheet, FileText } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface TransactionReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
  netTotal: number
}

function getDateRangeText(transactions: Transaction[]): string {
  if (transactions.length === 0) return "No transactions"
  const dates = transactions.map((t) => new Date(t.date + "T00:00:00").getTime())
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  if (minDate.getTime() === maxDate.getTime()) {
    return format(minDate, "MMM d, yyyy")
  }
  return `${format(minDate, "MMM d, yyyy")} – ${format(maxDate, "MMM d, yyyy")}`
}

export function TransactionReportDialog({
  open,
  onOpenChange,
  transactions,
  totalIncome,
  totalExpense,
  netTotal,
}: TransactionReportDialogProps) {
  const incomeTransactions = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.type === "income")
        .sort(
          (a, b) =>
            new Date(a.date + "T00:00:00").getTime() - new Date(b.date + "T00:00:00").getTime()
        ),
    [transactions]
  )

  const expenseTransactions = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.type === "expense")
        .sort(
          (a, b) =>
            new Date(a.date + "T00:00:00").getTime() - new Date(b.date + "T00:00:00").getTime()
        ),
    [transactions]
  )

  const handleExportPDF = () => {
    try {
      exportToPDF(transactions, totalIncome, totalExpense, netTotal)
      toast.success("Report saved as PDF")
    } catch {
      toast.error("Failed to save PDF")
    }
  }

  const handleExportExcel = () => {
    try {
      exportToExcel(transactions, totalIncome, totalExpense, netTotal)
      toast.success("Report saved as Excel")
    } catch {
      toast.error("Failed to save Excel")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-4xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Yamban FinTracker</DialogTitle>
          <p className="text-sm text-muted-foreground">Sales and Expense Report</p>
          <p className="text-xs text-muted-foreground">
            Period: {getDateRangeText(transactions)} &middot; Generated:{" "}
            {format(new Date(), "MMM d, yyyy")}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {/* Income Section */}
          {incomeTransactions.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-success">Income</h3>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-success/10 text-left">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Payment Mode</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeTransactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {format(new Date(t.date + "T00:00:00"), "MMM dd, yyyy")}
                        </td>
                        <td className="px-3 py-2">{t.description}</td>
                        <td className="px-3 py-2">{t.categoryLabel || t.category}</td>
                        <td className="px-3 py-2">
                          {paymentModeLabels[t.paymentMode as PaymentMode] || t.paymentMode}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-success/5 font-semibold text-success">
                      <td colSpan={4} className="px-3 py-2 text-right">
                        Subtotal:
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(totalIncome)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Expense Section */}
          {expenseTransactions.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-destructive">Expenses</h3>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-destructive/10 text-left">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Payment Mode</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTransactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {format(new Date(t.date + "T00:00:00"), "MMM dd, yyyy")}
                        </td>
                        <td className="px-3 py-2">{t.description}</td>
                        <td className="px-3 py-2">{t.categoryLabel || t.category}</td>
                        <td className="px-3 py-2">
                          {paymentModeLabels[t.paymentMode as PaymentMode] || t.paymentMode}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-destructive/5 font-semibold text-destructive">
                      <td colSpan={4} className="px-3 py-2 text-right">
                        Subtotal:
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(totalExpense)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Net Total */}
          <Separator className="my-4" />
          <div className="flex items-center justify-end gap-3 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Net Total:</span>
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                netTotal >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(Math.abs(netTotal))}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Save as PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Save as Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
