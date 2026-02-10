# Tech Stack

Complete technology breakdown for the Yamban FinTracker project.

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | Full-stack React framework (App Router) |
| **React** | 19.2.0 | UI component library |
| **TypeScript** | Strict mode | Type-safe JavaScript |

## Database & ORM

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | Latest | Relational database |
| **Prisma** | 7.3.0 | TypeScript-first ORM |
| **@prisma/adapter-pg** | 7.3.0 | Optimized PostgreSQL adapter |
| **pg** | 8.17.2 | PostgreSQL client for Node.js |

## UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.9 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Pre-built accessible components (New York style) |
| **Radix UI** | Various | Headless UI primitives (25+ components) |
| **Lucide React** | 0.454.0 | Icon library |
| **tailwindcss-animate** | 1.0.7 | Tailwind animation utilities |
| **tw-animate-css** | 1.3.3 | Additional CSS animations |
| **next-themes** | 0.4.6 | Dark/light theme management |

### Installed shadcn/ui Components

Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Carousel, Chart, Checkbox, Command, Dialog, Drawer, Dropdown Menu, Hover Card, Input, Input OTP, Label, Navigation Menu, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip

## Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 2.15.4 | React charting library (area charts, pie charts) |

## Form Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.60.0 | Performant form state management |
| **@hookform/resolvers** | 3.10.0 | Validation resolver integration |
| **Zod** | 3.25.76 | Schema validation library |

## Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 4.1.0 | Date manipulation and formatting |
| **clsx** | 2.1.1 | Conditional className construction |
| **tailwind-merge** | 3.3.1 | Intelligent Tailwind class merging |
| **class-variance-authority** | 0.7.1 | Component variant management |
| **cmdk** | 1.0.4 | Command palette component |
| **vaul** | 1.1.2 | Drawer component |
| **embla-carousel-react** | 8.5.1 | Carousel/slider component |
| **react-day-picker** | 9.8.0 | Date picker component |
| **react-resizable-panels** | 2.1.7 | Resizable panel layouts |
| **input-otp** | 1.4.1 | OTP input component |
| **Sonner** | 1.7.4 | Toast notification library |

## Analytics

| Technology | Version | Purpose |
|------------|---------|---------|
| **@vercel/analytics** | 1.3.1 | Page views and web vitals tracking |

## DevOps & Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Application containerization |
| **Docker Compose** | Latest | Multi-service orchestration |
| **Node.js** | 22 (Alpine) | Runtime environment |

## Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | Latest | Code linting |
| **PostCSS** | 8.5 | CSS processing pipeline |
| **@tailwindcss/postcss** | Latest | Tailwind PostCSS plugin |
| **tsx** | 4.21.0 | TypeScript execution (for seed scripts) |
| **dotenv** | 17.2.4 | Environment variable loading |
| **Prisma CLI** | 7.3.0 | Database migrations and generation |

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | App Router | Latest Next.js standard, server components by default |
| Data Fetching | Server Actions | No REST API overhead, type-safe, built-in CSRF |
| State Management | React useState | App complexity doesn't warrant Redux/Zustand |
| ORM | Prisma | Type-safe queries, auto-generated types, migration system |
| UI Components | shadcn/ui | Customizable, accessible, no vendor lock-in |
| Styling | Tailwind CSS | Utility-first, no context switching, fast iteration |
| Charts | Recharts | React-native, composable, good documentation |
| Theme | next-themes | Seamless dark/light mode with CSS variables |
| Database | PostgreSQL | Relational integrity, ACID compliance, proven reliability |
| Container | Docker | Consistent environments, easy onboarding |

## Color System

The app uses the **oklch** color space for perceptually uniform colors:

```css
/* Key colors (dark theme) */
--background: oklch(0.12 0.005 260);     /* Dark blue */
--foreground: oklch(0.98 0 0);           /* Near white */
--primary: oklch(0.7 0.15 250);          /* Blue */
--success: oklch(0.7 0.18 145);          /* Green */
--warning: oklch(0.75 0.15 80);          /* Yellow */
--destructive: oklch(0.6 0.2 25);        /* Red */
```

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive from 320px to 4K displays
