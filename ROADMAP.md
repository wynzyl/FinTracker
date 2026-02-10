# Roadmap

Planned features and improvements for Yamban FinTracker.

## Completed

### Payment Mode Feature (Feb 2026)

- [x] Add `PaymentMode` enum to database schema (Cash, GCash, BDO Savings, CBS Checking)
- [x] Payment mode field on all transactions (with `@default(cash)` for existing data)
- [x] Payment mode selector in add/edit transaction dialogs
- [x] Payment mode label displayed in transaction list
- [x] Cash Flow by Payment Mode summary report on dashboard
- [x] Filter transaction list by clicking a payment mode card
- [x] `getPaymentModeStats()` server action for aggregated reporting

## Phase 1: Foundation Hardening (Current)

Focus: Stability, code quality, and developer experience.

- [ ] Add automated tests (Jest + React Testing Library)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Remove `ignoreBuildErrors` from Next.js config and fix build errors
- [ ] Add input validation with Zod schemas on all server actions
- [ ] Improve error handling and user feedback
- [ ] Add loading skeletons for dashboard components

## Phase 2: Authentication & Multi-User

Focus: User accounts and data isolation.

- [ ] Implement authentication (NextAuth.js or Clerk)
- [ ] Add User model to database schema
- [ ] Associate transactions and categories with user accounts
- [ ] Add login/register pages
- [ ] Protect server actions with session validation
- [ ] Add user profile and settings page

## Phase 3: Enhanced Transaction Management

Focus: Better data entry and filtering.

- [ ] Date range filtering on dashboard
- [ ] Search transactions by description
- [ ] Filter transactions by category and type
- [ ] Combined filters (payment mode + category + date range)
- [ ] Pagination for transaction list
- [ ] Bulk delete transactions
- [ ] Recurring/scheduled transactions
- [ ] Transaction notes and attachments

## Phase 4: Budgeting & Goals

Focus: Financial planning tools.

- [ ] Set monthly budgets per category
- [ ] Budget vs actual spending comparison
- [ ] Budget alerts and notifications
- [ ] Savings goals with progress tracking
- [ ] Monthly/yearly financial summary reports

## Phase 5: Data Import/Export

Focus: Data portability and reporting.

- [ ] Export transactions to CSV
- [ ] Export transactions to PDF
- [ ] Import transactions from CSV
- [ ] Bank statement import (OFX/QIF format)
- [ ] Printable monthly reports
- [ ] Payment mode summary export

## Phase 6: Advanced Analytics

Focus: Deeper financial insights.

- [ ] Year-over-year comparison charts
- [ ] Spending trends and predictions
- [ ] Category spending heatmap
- [ ] Income vs expense ratio over time
- [ ] Cash flow trends by payment mode over time
- [ ] Custom date range reports
- [ ] Weekly/monthly/yearly view toggle

## Phase 7: Payment Mode Enhancements

Focus: Extend the payment mode system.

- [ ] Custom payment modes (user-defined, migrate from enum to separate table)
- [ ] Payment mode icons customization
- [ ] Payment mode-specific charts (bar chart, trend line)
- [ ] Default payment mode per category (auto-select)
- [ ] Payment mode balance tracking (running balance per account)

## Phase 8: Mobile & PWA

Focus: Mobile-first experience.

- [ ] Progressive Web App (PWA) support
- [ ] Offline data entry with sync
- [ ] Push notifications for budget alerts
- [ ] Mobile-optimized transaction entry
- [ ] Home screen installability

## Phase 9: Integrations

Focus: Connect with external services.

- [ ] Bank account linking (Plaid API)
- [ ] Currency conversion support
- [ ] Email receipt parsing
- [ ] Google Sheets sync
- [ ] Webhook notifications

## Future Considerations

- Multi-currency support
- Shared household accounts
- Financial advisor AI chatbot
- Investment portfolio tracking
- Tax category tagging and reporting
- Dark mode improvements with custom color themes

---

**Note**: This roadmap is subject to change based on user feedback and project priorities. Features are listed in suggested order but may be implemented in parallel.
