"use client"

import Link from "next/link"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { CategoryManagementDialog } from "@/components/category-management-dialog"
import { Button } from "@/components/ui/button"
import { Wallet, List } from "lucide-react"

interface HeaderProps {
  onTransactionAdded?: () => void
}

export function Header({ onTransactionAdded }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success">
            <Wallet className="h-5 w-5 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Yamban FinTracker</h1>
            <p className="text-xs text-muted-foreground">Income & Expense Monitor</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">
              <List className="mr-2 h-4 w-4" />
              Transactions
            </Link>
          </Button>
          <CategoryManagementDialog />
          <AddTransactionDialog onTransactionAdded={onTransactionAdded} />
        </div>
      </div>
    </header>
  )
}
