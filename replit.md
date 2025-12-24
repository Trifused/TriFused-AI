# TriFused - AI-Native Technology Services Platform

## Overview

TriFused is a modern web application showcasing AI-native technology services, including cybersecurity solutions, autonomous infrastructure, and generative growth engines. The platform features a marketing website with interactive elements, blog integration, contact forms, and diagnostic analytics capabilities. Built with React, Express, and PostgreSQL, it follows a full-stack TypeScript architecture with a focus on modern UI/UX patterns and data collection for business insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: Framer Motion for interactive elements
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom plugins

**Design Patterns:**
- Component-based architecture with reusable UI primitives
- Custom design system with "new-york" shadcn style variant
- Dark-themed cyberpunk aesthetic with cyan/neon accent colors
- Responsive design with mobile-first approach
- Glass morphism effects and gradient overlays

**Key Features:**
- Interactive hero section with typewriter effects
- Contact form dialog with API integration
- System diagnostics overlay for analytics collection
- Blog integration (external Blogger API)
- Cookie consent management
- Chat widget interface
- SEO meta tags with OpenGraph support

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES Modules)
- **ORM**: Drizzle ORM with Zod schema validation
- **Database**: PostgreSQL (via node-postgres)
- **Build Process**: esbuild for server bundling

**API Design:**
- RESTful endpoints with JSON payloads
- Request validation using Zod schemas
- Error handling with descriptive messages
- Logging middleware for request tracking

**Endpoints:**
- `POST /api/contact` - Contact form submissions
- `POST /api/diagnostics` - Anonymous diagnostic scan data collection

**Development vs Production:**
- Development: Vite dev server with HMR via middleware mode
- Production: Pre-built static files served via Express
- Conditional Replit-specific plugins in development

### Data Storage

**Database Schema (PostgreSQL):**

1. **contact_submissions**
   - Stores customer contact form data
   - Fields: id (UUID), name, email, company (optional), message, createdAt
   - Purpose: Lead generation and customer inquiries

2. **diagnostic_scans**
   - Anonymized user system analytics
   - Fields: id (UUID), platform, userAgent, screenResolution, isSecure, browserCores, scannedAt
   - Purpose: Analytics for understanding visitor technical profiles

**ORM Layer:**
- Drizzle ORM with typed schema definitions
- Insert schemas generated via drizzle-zod for validation
- Migrations managed via drizzle-kit
- Connection pooling with pg.Pool

**Design Rationale:**
- UUID primary keys for better distribution and security
- Separate tables for different data concerns (GDPR-friendly)
- Timestamp fields with automatic defaults
- Schema-first approach with type safety throughout the stack

### External Dependencies

**Core Infrastructure:**
- **Neon/PostgreSQL**: Primary database (DATABASE_URL required)
- **Replit Platform**: Deployment environment with specialized plugins
  - `@replit/vite-plugin-cartographer` - Development tooling
  - `@replit/vite-plugin-dev-banner` - Development indicators
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay

**Frontend Libraries:**
- **Radix UI**: Accessible component primitives (20+ components)
- **Tailwind CSS**: Utility-first styling with @tailwindcss/vite plugin
- **Framer Motion**: Animation library for interactive elements
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with @hookform/resolvers
- **date-fns**: Date formatting and manipulation
- **Wouter**: Lightweight routing solution
- **Sonner**: Toast notifications

**Build & Development:**
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type safety across the entire stack
- **tsx**: TypeScript execution for development

**Fonts:**
- Google Fonts: Inter (sans-serif), Outfit (headings), JetBrains Mono (code)

**Custom Plugins:**
- `vite-plugin-meta-images.ts`: Automatically updates OpenGraph/Twitter meta tags with Replit deployment URLs

**Path Aliases:**
- `@/*`: Client source files
- `@shared/*`: Shared schema and types
- `@assets/*`: Static assets

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment flag (development/production)
- `REPL_ID`: Replit-specific identifier for conditional plugin loading

**Build Strategy:**
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.cjs` with selective dependencies bundled (allowlist pattern to reduce cold start times)
- Static serving: Express serves pre-built client in production

## FAQ / Help Notes

### Website Grader - Scan History

**Q: Is scan history saved to my account or just my browser?**

A: Scan history is stored in your browser's localStorage (key: `trifused_scan_history`), not on our servers. This means:
- History is private to each browser/device
- Clearing browser data will erase history
- Different browsers or devices won't share history
- No account or login is required to use the grader
- Maximum of 10 scans are stored in history

### Feature Flags System

The platform uses a feature flag system (`shared/feature-flags.ts`) to manage free, paid, and coming soon features. Super admins can view all feature flags in the Admin Panel → Features tab.

**Feature Statuses:**
- `free` - Available to all users
- `paid` - Requires subscription (tier-based)
- `coming_soon` - Announced but not yet available
- `disabled` - Feature is turned off

**Feature Tiers:**
- `basic` - Entry-level paid features
- `pro` - Professional tier features  
- `enterprise` - Enterprise-only features
- `api` - API access tier

**Feature Categories:**
- `grader` - Website grader features
- `reports` - Report generation features
- `api` - TrifusedAI API features
- `payments` - Payment and subscription features
- `portal` - User portal features

**Current Premium Features (Coming Soon):**

*Grader:*
- Google Lighthouse Integration - Core Web Vitals powered by Lighthouse ($pro)
- AI Vision Detection - Visual badge detection using AI ($pro)
- Scheduled Scans - Automated recurring website scans ($pro)
- Multi-Site Monitoring - Monitor multiple websites ($pro)
- Bulk Scans - Scan multiple websites at once ($enterprise)

*Reports:*
- Advanced AI Compliance Report - One-time purchase ($9.99)
- White Label Reports - Custom branded PDF reports ($enterprise)
- PDF Export - Download reports as PDF ($pro)

*API (TrifusedAI):*
- TrifusedAI API - REST API access ($25.67/year)
- POST /v1/score Endpoint - Machine-callable health check
- Lighthouse Mode - Include Lighthouse data in API responses
- CI/CD Integrations - GitHub Actions, Jenkins, GitLab CI support

*Payments:*
- Stripe Payments - Payment processing integration
- One-Time Purchases - Pay-per-report for AI reports
- Subscription Plans - Monthly plans for multi-site/scheduled scans
- API Access Tier - $25.67/year for 1000 calls/month

*Portal:*
- API Key Management - Generate and manage API keys
- Usage Statistics - Track API usage and quotas
- Team Seats - Add team members ($enterprise)

**UI Components:**
- `FeatureBadge` - Shows Coming Soon/Paid badges with tier colors
- `FeatureGate` - Conditionally renders content based on feature status

**Adding New Features:**
1. Add feature to `FEATURE_FLAGS` in `shared/feature-flags.ts`
2. Set category, status, tier, and optional price
3. Use `FeatureBadge` component to show status in UI
4. View all flags in Admin Panel → Features tab
5. When ready to launch, change status to `free` or `paid`