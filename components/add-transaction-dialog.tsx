"use client"

import React from "react"

import { useState, useEffect } from "react"
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
import { createTransaction } from "@/app/actions/transactions"
import { getCategoriesByType } from "@/app/actions/categories"
import type { TransactionType } from "@/lib/types"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  label: string
  icon: string | null
  type: TransactionType
}

interface AddTransactionDialogProps {
  onTransactionAdded?: () => void
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories when type changes or dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [type, open])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByType(type)
      setCategories(data as Category[])
      // Reset category selection when type changes
      setCategoryId("")
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
      const result = await createTransaction({
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

      toast.success("Transaction added successfully!")

      // Reset form
      setDescription("")
      setAmount("")
      setCategoryId("")
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
