"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TransactionItem } from "@/components/transaction-item"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { useDeleteConfirm } from "@/hooks/use-delete-confirm"
import { deleteTransaction } from "@/app/actions/transactions"
import type { Transaction } from "@/lib/types"
import { useState } from "react"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: () => void
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingId,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useDeleteConfirm({
    onDelete: deleteTransaction,
    onSuccess: onDelete,
    successMessage: "Transaction deleted successfully",
    errorMessage: "Failed to delete transaction",
  })

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 px-6 pb-6">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions found. Add your first transaction to get started!
              </div>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={setEditingTransaction}
                  onDelete={handleDeleteClick}
                  isDeleting={deletingId === transaction.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null)
          }}
          onTransactionUpdated={() => {
            setEditingTransaction(null)
            onDelete()
          }}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </Card>
  )
}
