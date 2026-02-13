"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm, type TransactionFormValues } from "@/components/transaction-form"
import { updateTransaction } from "@/app/actions/transactions"
import type { Transaction } from "@/lib/types"
import { Save } from "lucide-react"
import { toast } from "sonner"

interface EditTransactionDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionUpdated?: () => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onTransactionUpdated,
}: EditTransactionDialogProps) {
  const [loading, setLoading] = useState(false)

  const initialValues: TransactionFormValues = useMemo(() => ({
    type: transaction.type,
    description: transaction.description,
    amount: transaction.amount.toString(),
    categoryId: transaction.categoryId || "",
    category: transaction.category || "",
    date: transaction.date,
    paymentMode: transaction.paymentMode || "cash",
  }), [transaction])

  const handleSubmit = async (values: TransactionFormValues) => {
    setLoading(true)
    try {
      const result = await updateTransaction(transaction.id, {
        description: values.description,
        amount: Number.parseFloat(values.amount),
        type: values.type,
        category: values.category as import("@/lib/types").Category,
        categoryId: values.categoryId,
        date: values.date,
        paymentMode: values.paymentMode,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Transaction updated successfully!")
      onOpenChange(false)
      onTransactionUpdated?.()
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast.error("Failed to update transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Update Transaction"
          loadingLabel="Updating..."
          submitIcon={<Save className="h-4 w-4 mr-2" />}
          isOpen={open}
          matchCategoryByName={transaction.category}
          footer={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Transaction
                  </>
                )}
              </Button>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
