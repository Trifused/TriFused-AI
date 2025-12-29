# TriFused - AI-Native Technology Services Platform

## Overview

TriFused is a modern web application showcasing AI-native technology services, including cybersecurity solutions, autonomous infrastructure, and generative growth engines. It features a marketing website with interactive elements, blog integration, contact forms, and diagnostic analytics. The platform is built with React, Express, and PostgreSQL, utilizing a full-stack TypeScript architecture focused on modern UI/UX and data collection for business insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend uses React 18 with TypeScript, Wouter for routing, and Tailwind CSS for styling, configured with a custom dark-themed cyberpunk aesthetic featuring cyan/neon accents and glass morphism effects. It leverages Radix UI and shadcn/ui for components, and Framer Motion for animations. The design is responsive and mobile-first, incorporating interactive elements like a typewriter effect in the hero section.

### Technical Implementations

**Frontend:**
- **Technology Stack:** React 18, TypeScript, Wouter, Tailwind CSS, Radix UI, shadcn/ui, Framer Motion, TanStack Query, Vite.
- **Features:** Interactive hero, contact form, system diagnostics, blog integration, cookie consent, chat widget, SEO meta tags.

**Backend:**
- **Technology Stack:** Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (via node-postgres), esbuild.
- **API Design:** RESTful endpoints with JSON payloads, Zod for request validation, robust error handling, and logging.
- **Endpoints:** `POST /api/contact` for submissions and `POST /api/diagnostics` for anonymous data collection.

**Data Storage:**
- **Database:** PostgreSQL.
- **Schema:** `contact_submissions` for inquiries and `diagnostic_scans` for anonymized analytics, both using UUIDs and timestamp fields.
- **ORM:** Drizzle ORM with typed schema definitions and drizzle-kit for migrations.

**System Design Choices:**
- **Feature Flag System:** Manages feature availability (free, paid, coming_soon, disabled) and tiers (basic, pro, enterprise, api) for features like graders, reports, and API access.
- **API Rate Limiting:** Tier-based rate limiting (free, starter, pro, enterprise) implemented with `optionalApiKeyAuth` and `apiRateLimit` middleware, including monitoring and administrative controls.
- **Stripe Customer Linking:** Automatically links Stripe customers to portal accounts for purchases like call packs and subscriptions.
- **Token Payment System:** A token-based system for purchasing and spending on premium features, managed through `token_packages`, `token_wallets`, `token_transactions`, and `token_pricing` database tables, integrated with Stripe.
- **Circuit Breaker Pattern:** Uses the `opossum` library for external service calls (e.g., email, Stripe, OpenAI) to prevent cascading failures, with configurable timeouts and error thresholds.
- **Website Report Scheduler:** Automated email delivery of website grade report cards to portal users. Supports instant sending and scheduled delivery (daily, weekly, monthly frequencies). Uses `website_report_schedules` table for persistence and `websiteReportScheduler.ts` for background processing.
- **AI Readiness Scoring:** Evaluates websites for AI crawler and agent compatibility. Includes Content Accessibility (SSR detection, noscript fallback), Structured Data (JSON-LD, OpenGraph), MCP Compliance (endpoint detection), and Crawlability (robots.txt, llms.txt). Implemented in `aiReadinessService.ts` with weighted scoring breakdown.

## External Dependencies

- **Database:** Neon/PostgreSQL
- **Deployment:** Replit Platform (with `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, `@replit/vite-plugin-runtime-error-modal`)
- **Frontend Libraries:** Radix UI, Tailwind CSS, Framer Motion, TanStack Query, React Hook Form, date-fns, Wouter, Sonner.
- **Build & Development Tools:** Vite, esbuild, TypeScript, tsx.
- **Fonts:** Google Fonts (Inter, Outfit, JetBrains Mono).
- **APIs:** Blogger API (for blog integration), Stripe, OpenAI (for future AI features).