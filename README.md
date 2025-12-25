# TriFused - AI-Native Technology Services Platform

A modern web application for AI-native technology services, featuring a comprehensive Website Grader tool, e-commerce with Stripe, and a full admin dashboard.

## Features

### Website Grader
- **Comprehensive Analysis** - SEO, security, performance, accessibility, and mobile scores
- **Compliance Checks** - FDIC, SEC, ADA, PCI, FCA, GDPR compliance scoring
- **Shareable Reports** - QR codes and public share links for each scan
- **Scan History** - Track all website scans with grades and timestamps

### API System
- **RESTful API** - `/api/v1/score` endpoint for programmatic access
- **API Key Management** - Generate and manage multiple API keys
- **Usage Tracking** - Monitor API calls with quota management
- **CI/CD Integration** - JSON responses suitable for deployment pipelines

### E-Commerce (Stripe)
- **AI Reports** - One-time purchase for detailed compliance reports
- **API Subscriptions** - Monthly plans with call quotas
- **Call Packs** - Purchase additional API calls as needed

### Admin Dashboard
- **Production Analytics** - 24-hour HTTP status codes and response times
- **Website Grader Stats** - Total scans, average scores, daily activity
- **Customer Service** - Orders, subscriptions, and customer management
- **Lead Tracking** - Chat leads, email signups, contact submissions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom cyberpunk theme
- **Radix UI** / shadcn/ui components
- **Framer Motion** animations
- **TanStack Query** for server state
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** (ES Modules)
- **Drizzle ORM** with PostgreSQL
- **Zod** schema validation

### Infrastructure
- **PostgreSQL** database (Neon)
- **Stripe** payment processing
- **Vite** build tool
- **Replit** deployment

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### Environment Variables
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Installation
```bash
npm install
npm run db:push
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## API Usage

### Get Website Score
```bash
curl -X GET "https://your-domain.com/api/v1/score?url=example.com&threshold=70" \
  -H "X-API-Key: your_api_key"
```

### Response
```json
{
  "status": "pass",
  "overall": { "score": 85, "grade": "B" },
  "categories": {
    "seo": { "score": 90, "grade": "A" },
    "security": { "score": 80, "grade": "B" },
    "performance": { "score": 85, "grade": "B" }
  },
  "meta": {
    "scanId": "uuid",
    "shareToken": "abc123",
    "reportUrl": "https://your-domain.com/report/abc123"
  }
}
```

## Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   └── hooks/        # Custom hooks
├── server/           # Express backend
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Database interface
│   └── apiService.ts # API key & quota management
├── shared/           # Shared types & schemas
│   └── schema.ts     # Drizzle schema
└── drizzle/          # Database migrations
```

## License

Proprietary - TriFused LLC

## Support

Contact: support@trifused.com
