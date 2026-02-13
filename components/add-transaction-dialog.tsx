"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm, type TransactionFormValues } from "@/components/transaction-form"
import { createTransaction } from "@/app/actions/transactions"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface AddTransactionDialogProps {
  onTransactionAdded?: () => void
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)

  const defaultValues: TransactionFormValues = useMemo(() => ({
    type: "expense",
    description: "",
    amount: "",
    categoryId: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
  }), [])

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      const result = await createTransaction({
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

      toast.success("Transaction added successfully!")
      setOpen(false)
      onTransactionAdded?.()
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast.error("Failed to add transaction")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          initialValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Add Transaction"
          loadingLabel="Adding..."
          isOpen={open}
        />
      </DialogContent>
    </Dialog>
  )
}
