"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTransaction } from "@/app/actions/transactions"
import { getCategoriesByType } from "@/app/actions/categories"
import type { Transaction, TransactionType } from "@/lib/types"
import { Save } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  label: string
  icon: string | null
  type: TransactionType
}

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
  const [type, setType] = useState<TransactionType>(transaction.type)
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [categoryId, setCategoryId] = useState<string>(
    transaction.categoryId || ""
  )
  const [date, setDate] = useState(transaction.date)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories when dialog opens or type changes
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [type, open])

  // Find category ID when categories are loaded (if not already set)
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      const matchingCategory = categories.find(
        (cat) => cat.name === transaction.category || cat.name.toLowerCase() === transaction.category.toLowerCase()
      )
      if (matchingCategory) {
        setCategoryId(matchingCategory.id)
      }
    }
  }, [categories, transaction.category, categoryId])

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setDescription(transaction.description)
      setAmount(transaction.amount.toString())
      setDate(transaction.date)
      setCategoryId(transaction.categoryId || "")
    }
  }, [transaction])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByType(type)
      setCategories(data as Category[])
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Failed to load categories")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !categoryId || !date) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const result = await updateTransaction(transaction.id, {
        description,
        amount: Number.parseFloat(amount),
        type,
        category: "other-expense", // Not used when categoryId is provided
        categoryId,
        date,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Transaction updated successfully!")

      // Reset form and close dialog
      onOpenChange(false)

      // Refresh dashboard data
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income")
                setCategoryId("")
              }}
              className={
                type === "income"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : ""
              }
            >
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense")
                setCategoryId("")
              }}
              className={
                type === "expense"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Expense
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value.toUpperCase())}
              className="border-border/50 bg-secondary uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-border/50 bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="border-border/50 bg-secondary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card">
                {categories.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/50 bg-secondary"
              required
            />
          </div>

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
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Transaction
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
