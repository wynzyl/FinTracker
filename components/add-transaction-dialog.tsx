"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { categoryLabels } from "@/lib/data"
import { createTransaction } from "@/app/actions/transactions"
import type { Category, TransactionType } from "@/lib/types"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const incomeCategories: Category[] = ["salary", "freelance", "investments", "other-income"]
const expenseCategories: Category[] = [
  "food",
  "gas",
  "repair",
  "electricity",
  "water",
  "internet",
  "phone",
  "other-utilities",
  "entertainment",
  "shopping",
  "health",
  "other-expense",
]

interface AddTransactionDialogProps {
  onTransactionAdded?: () => void
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const categories = type === "income" ? incomeCategories : expenseCategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !category || !date) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await createTransaction({
        description,
        amount: Number.parseFloat(amount),
        type,
        category: category as Category,
        date,
      })

      toast.success("Transaction added successfully!")
      
      // Reset form
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
      setOpen(false)
      
      // Refresh dashboard data
      if (onTransactionAdded) {
        onTransactionAdded()
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast.error("Failed to add transaction")
    } finally {
      setLoading(false)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income")
                setCategory("")
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
                setCategory("")
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
              onChange={(e) => setDescription(e.target.value)}
              className="border-border/50 bg-secondary"
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
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="border-border/50 bg-secondary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
