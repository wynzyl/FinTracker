"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategoriesByType } from "@/app/actions/categories"
import type { TransactionType, PaymentMode } from "@/lib/types"
import { paymentModeLabels } from "@/lib/types"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  label: string
  icon: string | null
  type: TransactionType
}

export interface TransactionFormValues {
  type: TransactionType
  description: string
  amount: string
  categoryId: string
  category: string
  date: string
  paymentMode: PaymentMode
}

interface TransactionFormProps {
  initialValues: TransactionFormValues
  onSubmit: (values: TransactionFormValues) => Promise<void>
  submitLabel: string
  loadingLabel: string
  submitIcon?: React.ReactNode
  footer?: React.ReactNode
  isOpen: boolean
  matchCategoryByName?: string
}

export function TransactionForm({
  initialValues,
  onSubmit,
  submitLabel,
  loadingLabel,
  submitIcon,
  footer,
  isOpen,
  matchCategoryByName,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialValues.type)
  const [description, setDescription] = useState(initialValues.description)
  const [amount, setAmount] = useState(initialValues.amount)
  const [categoryId, setCategoryId] = useState(initialValues.categoryId)
  const [date, setDate] = useState(initialValues.date)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialValues.paymentMode)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const isFirstLoad = useRef(true)

  // Reset form when initialValues change (e.g. when editing a different transaction)
  useEffect(() => {
    setType(initialValues.type)
    setDescription(initialValues.description)
    setAmount(initialValues.amount)
    setCategoryId(initialValues.categoryId)
    setDate(initialValues.date)
    setPaymentMode(initialValues.paymentMode)
    isFirstLoad.current = true
  }, [initialValues.type, initialValues.description, initialValues.amount, initialValues.categoryId, initialValues.date, initialValues.paymentMode])

  // Load categories when type changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [type, isOpen])

  // Match category by name when categories are loaded (for edit mode)
  useEffect(() => {
    if (matchCategoryByName && categories.length > 0 && !categoryId) {
      const match = categories.find(
        (cat) => cat.name === matchCategoryByName || cat.name.toLowerCase() === matchCategoryByName.toLowerCase()
      )
      if (match) setCategoryId(match.id)
    }
  }, [categories, matchCategoryByName, categoryId])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesByType(type)
      setCategories(data as Category[])
      // Only clear categoryId when the type actually changes, not on first load
      if (isFirstLoad.current) {
        isFirstLoad.current = false
      } else {
        setCategoryId("")
      }
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
      const selectedCategory = categories.find((cat) => cat.id === categoryId)
      const category = selectedCategory?.name || ""
      await onSubmit({ type, description, amount, categoryId, category, date, paymentMode })
    } finally {
      setLoading(false)
    }
  }

  return (
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
        <Label htmlFor="paymentMode">Payment Mode</Label>
        <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as PaymentMode)}>
          <SelectTrigger className="border-border/50 bg-secondary">
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent className="border-border/50 bg-card">
            {(Object.entries(paymentModeLabels) as [PaymentMode, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
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

      {footer || (
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingLabel : (
            <>
              {submitIcon}
              {submitLabel}
            </>
          )}
        </Button>
      )}
    </form>
  )
}
