import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { formatCurrency } from "./utils"
import { paymentModeLabels } from "./types"
import type { Transaction, PaymentMode } from "./types"

interface ExportRow {
  date: string
  description: string
  category: string
  paymentMode: string
  amount: string
}

function sortChronologically(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date + "T00:00:00").getTime()
    const dateB = new Date(b.date + "T00:00:00").getTime()
    return dateA - dateB
  })
}

function toExportRow(t: Transaction): ExportRow {
  return {
    date: format(new Date(t.date + "T00:00:00"), "MMM dd, yyyy"),
    description: t.description,
    category: t.categoryLabel || t.category,
    paymentMode: paymentModeLabels[t.paymentMode as PaymentMode] || t.paymentMode,
    amount: formatCurrency(t.amount),
  }
}

function getDateRangeText(transactions: Transaction[]): string {
  if (transactions.length === 0) return "No transactions"
  const dates = transactions.map((t) => new Date(t.date + "T00:00:00").getTime())
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  if (minDate.getTime() === maxDate.getTime()) {
    return format(minDate, "MMM d, yyyy")
  }
  return `${format(minDate, "MMM d, yyyy")} – ${format(maxDate, "MMM d, yyyy")}`
}

function getFileName(extension: string): string {
  return `transactions-report-${format(new Date(), "yyyy-MM-dd")}.${extension}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToPDF(
  transactions: Transaction[],
  totalIncome: number,
  totalExpense: number,
  netTotal: number
) {
  const doc = new jsPDF({ orientation: "landscape" })
  const columns = ["Date", "Description", "Category", "Payment Mode", "Amount"]

  const incomeTransactions = sortChronologically(transactions.filter((t) => t.type === "income"))
  const expenseTransactions = sortChronologically(transactions.filter((t) => t.type === "expense"))

  // Title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Yamban FinTracker", 14, 18)

  // Subtitle
  doc.setFontSize(13)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80)
  doc.text("Sales and Expense Report", 14, 26)

  // Date range and export date
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Period: ${getDateRangeText(transactions)}`, 14, 34)
  doc.text(`Exported: ${format(new Date(), "MMM d, yyyy")}`, 14, 40)
  doc.setTextColor(0)

  let currentY = 46

  // --- Income Section ---
  if (incomeTransactions.length > 0) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(34, 139, 34)
    doc.text("Income", 14, currentY)
    doc.setTextColor(0)
    currentY += 2

    const incomeRows = incomeTransactions.map((t) => {
      const r = toExportRow(t)
      return [r.date, r.description, r.category, r.paymentMode, r.amount]
    })

    autoTable(doc, {
      head: [columns],
      body: incomeRows,
      startY: currentY,
      theme: "striped",
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: "auto" },
        4: { halign: "right" },
      },
      foot: [["", "", "", "Subtotal:", formatCurrency(totalIncome)]],
      footStyles: {
        fillColor: [240, 253, 244],
        textColor: [34, 139, 34],
        fontStyle: "bold",
        fontSize: 9,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 10
  }

  // --- Expense Section ---
  if (expenseTransactions.length > 0) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(220, 38, 38)
    doc.text("Expenses", 14, currentY)
    doc.setTextColor(0)
    currentY += 2

    const expenseRows = expenseTransactions.map((t) => {
      const r = toExportRow(t)
      return [r.date, r.description, r.category, r.paymentMode, r.amount]
    })

    autoTable(doc, {
      head: [columns],
      body: expenseRows,
      startY: currentY,
      theme: "striped",
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: "auto" },
        4: { halign: "right" },
      },
      foot: [["", "", "", "Subtotal:", formatCurrency(totalExpense)]],
      footStyles: {
        fillColor: [254, 242, 242],
        textColor: [220, 38, 38],
        fontStyle: "bold",
        fontSize: 9,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 12
  }

  // --- Net Total ---
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  const netColor = netTotal >= 0 ? [34, 139, 34] : [220, 38, 38]
  doc.setTextColor(netColor[0], netColor[1], netColor[2])
  doc.text(
    `Net Total:  ${formatCurrency(Math.abs(netTotal))}`,
    14,
    currentY
  )

  doc.save(getFileName("pdf"))
}

export function exportToExcel(
  transactions: Transaction[],
  totalIncome: number,
  totalExpense: number,
  netTotal: number
) {
  const columns = ["Date", "Description", "Category", "Payment Mode", "Amount"]

  const incomeTransactions = sortChronologically(transactions.filter((t) => t.type === "income"))
  const expenseTransactions = sortChronologically(transactions.filter((t) => t.type === "expense"))

  // Build data array with title and subtitle
  const data: (string | number)[][] = [
    ["Yamban FinTracker"],
    ["Sales and Expense Report"],
    [`Period: ${getDateRangeText(transactions)}`],
    [],
  ]

  // --- Income Section ---
  if (incomeTransactions.length > 0) {
    data.push(["Income"])
    data.push(columns)
    incomeTransactions.forEach((t) => {
      const r = toExportRow(t)
      data.push([r.date, r.description, r.category, r.paymentMode, r.amount])
    })
    data.push(["", "", "", "Subtotal:", formatCurrency(totalIncome)])
    data.push([])
  }

  // --- Expense Section ---
  if (expenseTransactions.length > 0) {
    data.push(["Expenses"])
    data.push(columns)
    expenseTransactions.forEach((t) => {
      const r = toExportRow(t)
      data.push([r.date, r.description, r.category, r.paymentMode, r.amount])
    })
    data.push(["", "", "", "Subtotal:", formatCurrency(totalExpense)])
    data.push([])
  }

  // --- Net Total ---
  data.push([
    "",
    "",
    "",
    "Net Total:",
    formatCurrency(Math.abs(netTotal)),
  ])

  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // Merge title, subtitle, and period cells across columns
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
  ]

  // Set column widths
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 30 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  downloadBlob(blob, getFileName("xlsx"))
}
