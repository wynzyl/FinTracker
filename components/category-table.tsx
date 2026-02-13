"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  label: string
  icon: string | null
}

interface CategoryTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  loading: boolean
  emptyMessage: string
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  loading,
  emptyMessage,
}: CategoryTableProps) {
  if (loading && categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Icon</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Label</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="text-2xl">
              {category.icon || <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="font-mono text-sm">{category.name}</TableCell>
            <TableCell>{category.label}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(category)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(category.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
