"use client"

import React, { useState, useEffect } from "react"
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
import { CategoryTable } from "@/components/category-table"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  type CategoryData,
} from "@/app/actions/categories"
import type { TransactionType } from "@/lib/types"
import { Settings, Plus, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  label: string
  icon: string | null
  type: TransactionType
  createdAt: Date
  updatedAt: Date
}

export function CategoryManagementDialog() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<CategoryData, "id">>({
    name: "",
    label: "",
    icon: "",
    type: "expense",
  })

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data as Category[])
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      icon: "",
      type: "expense",
    })
    setEditingId(null)
  }

  const handleEdit = (category: { id: string; name: string; label: string; icon: string | null }) => {
    const fullCategory = categories.find((c) => c.id === category.id)
    if (!fullCategory) return
    setFormData({
      name: fullCategory.name,
      label: fullCategory.label,
      icon: fullCategory.icon || "",
      type: fullCategory.type,
    })
    setEditingId(fullCategory.id)
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.label) {
      toast.error("Please fill in required fields (Name and Label)")
      return
    }

    // Validate name format (uppercase, no spaces, alphanumeric and hyphens only)
    const nameRegex = /^[A-Z0-9-]+$/
    if (!nameRegex.test(formData.name)) {
      toast.error("Name must be uppercase, alphanumeric, and can contain hyphens only")
      return
    }

    try {
      setLoading(true)
      if (editingId) {
        await updateCategory(editingId, formData)
        toast.success("Category updated successfully!")
      } else {
        await createCategory(formData)
        toast.success("Category created successfully!")
      }
      resetForm()
      await loadCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      setLoading(true)
      await deleteCategory(categoryToDelete)
      toast.success("Category deleted successfully!")
      await loadCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage Categories
          </Button>
        </DialogTrigger>
        <DialogContent className="border-border/50 bg-card sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h3>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v as TransactionType })
                    }
                  >
                    <SelectTrigger className="border-border/50 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., SALARY, FOOD"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value.toUpperCase() })
                    }
                    className="border-border/50 bg-background uppercase"
                    required
                    disabled={!!editingId}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uppercase, alphanumeric, hyphens only
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">
                    Label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="label"
                    placeholder="e.g., SALARY, FOOD & DINING"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value.toUpperCase() })
                    }
                    className="border-border/50 bg-background uppercase"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Optional)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., 💼, 🍔"
                    value={formData.icon || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value || undefined })
                    }
                    className="border-border/50 bg-background"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground">Emoji or icon (optional)</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  "Saving..."
                ) : editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Category
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </Button>
            </form>

            {/* Categories List */}
            <div className="space-y-4">
              <h3 className="font-semibold">Income Categories</h3>
              <CategoryTable
                categories={incomeCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                loading={loading}
                emptyMessage="No income categories yet"
              />

              <h3 className="font-semibold mt-6">Expense Categories</h3>
              <CategoryTable
                categories={expenseCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                loading={loading}
                emptyMessage="No expense categories yet"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone. Categories that are used in transactions cannot be deleted."
      />
    </>
  )
}
