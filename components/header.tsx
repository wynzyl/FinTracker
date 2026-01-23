"use client"

import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { Wallet } from "lucide-react"

interface HeaderProps {
  onTransactionAdded?: () => void
}

export function Header({ onTransactionAdded }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success">
            <Wallet className="h-5 w-5 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">FinTrack</h1>
            <p className="text-xs text-muted-foreground">Income & Expense Monitor</p>
          </div>
        </div>
        <AddTransactionDialog onTransactionAdded={onTransactionAdded} />
      </div>
    </header>
  )
}
