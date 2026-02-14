# Roadmap

Planned features and improvements for Yamban FinTracker.

## Phase 1: Foundation Hardening (Completed)

Focus: Stability, code quality, and developer experience.

- [x] Add automated tests (Jest + React Testing Library)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [x] Remove `ignoreBuildErrors` from Next.js config and fix build errors
- [x] Add input validation with Zod schemas on all server actions
- [x] Improve error handling and user feedback (standardized `ActionResult` type)
- [x] Add loading skeletons for dashboard components

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

- [x] Date range filtering on dashboard (current date filtering applied)
- [ ] Search transactions by description
- [x] Filter transactions by category and type
- [ ] Pagination for transaction list
- [ ] Bulk delete transactions
- [ ] Recurring/scheduled transactions
- [ ] Transaction notes and attachments
- [x] Payment mode tracking and filtering
- [x] Dedicated transactions page with date presets (Today, This Week, Custom Range)
- [x] Transaction report generation

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

## Phase 6: Advanced Analytics

Focus: Deeper financial insights.

- [ ] Year-over-year comparison charts
- [ ] Spending trends and predictions
- [ ] Category spending heatmap
- [ ] Income vs expense ratio over time
- [ ] Custom date range reports
- [ ] Weekly/monthly/yearly view toggle

## Phase 7: Mobile & PWA

Focus: Mobile-first experience.

- [ ] Progressive Web App (PWA) support
- [ ] Offline data entry with sync
- [ ] Push notifications for budget alerts
- [ ] Mobile-optimized transaction entry
- [ ] Home screen installability

## Phase 8: Integrations

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
