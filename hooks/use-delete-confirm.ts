"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseDeleteConfirmOptions {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
  successMessage?: string
  errorMessage?: string
}

export function useDeleteConfirm({
  onDelete,
  onSuccess,
  successMessage = "Deleted successfully",
  errorMessage = "Failed to delete",
}: UseDeleteConfirmOptions) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setDeletingId(itemToDelete)
    try {
      const result = await onDelete(itemToDelete)
      if (!result.success) {
        toast.error(result.error || errorMessage)
        return
      }
      toast.success(successMessage)
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting:", error)
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    deletingId,
    handleDeleteClick,
    handleDeleteConfirm,
  }
}
