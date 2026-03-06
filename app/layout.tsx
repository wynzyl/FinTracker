import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinTrack - Sales & Expense Monitoring',
  description: 'Track your sales and expenses with beautiful visualizations',
 
  icons: {
    icon: [
      {
        url: 'YambanLogo.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'YambanLogo.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'YambanLogo.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
