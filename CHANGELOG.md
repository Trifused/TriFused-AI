# Changelog

All notable changes to the TriFused platform will be documented in this file.

## [2.5.0] - 2025-12-25

### Added
- **Production Analytics Dashboard** - New admin analytics section showing HTTP status codes, response times, and top API endpoints over 24 hours
- **Merged Scan History** - Combined website scans and API calls into a unified chronological view in the portal
- **API Call Grade Tracking** - API calls now store and display grade metadata (score, shareToken) with View Report buttons
- **Enhanced Website Grader Dashboard Card** - Featured styling with gradient background, crown icon, and enhanced stats (total sites, avg score, today's scans)

### Changed
- Reordered dashboard cards: Website Grader now appears first as the primary feature
- API usage logs now include grade metadata for better tracking
- Scan History displays both website scans (with letter grades) and API calls (with status codes)

### Fixed
- API key authentication now correctly uses `consumeApiCall` for proper usage logging and quota deduction
- Negative balance feature allows API calls even when quota is exceeded while still tracking usage

## [2.4.0] - 2025-12-24

### Added
- Test API Console in My Websites portal
- API usage tracking with quota management
- Call pack purchases for API quota top-ups
- Manual API key testing with X-API-Key header support

### Changed
- API validation returns apiKey object directly for streamlined authentication
- Impersonation handling charges API calls to key owner

## [2.3.0] - 2025-12-23

### Added
- Website Grader with compliance checks (FDIC, SEC, ADA, PCI, FCA, GDPR)
- Shareable reports with QR codes
- My Websites portal with tabbed navigation
- API key management system

### Changed
- Enhanced scan history with ownership-scoped data access

## [2.2.0] - 2025-12-20

### Added
- Stripe integration for e-commerce
- AI Reports one-time purchase ($9.99)
- API subscription tiers with call tracking
- Customer service dashboard

## [2.1.0] - 2025-12-15

### Added
- User authentication with session management
- Superuser admin panel
- Chat leads and email signup tracking
- Contact form submissions

## [2.0.0] - 2025-12-10

### Added
- Complete website redesign with cyberpunk aesthetic
- Interactive hero section with typewriter effects
- Blog integration via Blogger API
- Cookie consent management
- System diagnostics overlay

## [1.0.0] - 2025-12-01

### Added
- Initial release
- Marketing website for TriFused technology services
- Contact form with API integration
- PostgreSQL database with Drizzle ORM
- React frontend with Tailwind CSS
