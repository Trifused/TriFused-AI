# Pakistani Payment Gateway Integration Guide

## Overview

This document outlines the integration requirements for JazzCash and Easypaisa - Pakistan's leading mobile payment gateways targeting Lahore's 15,000+ business market.

## JazzCash Integration

### Official Resources
- **Developer Portal**: https://developer.jazzcash.com.pk/
- **Sandbox Environment**: https://sandbox.jazzcash.com.pk/
- **Merchant Portal**: https://www.jazzcash.com.pk/corporate/online-payment-gateway/
- **Support Email**: merchantsupport@jazzcom.com.pk

### Features
- Payment methods: Mobile wallet, Credit/Debit cards (Visa/MasterCard), Vouchers
- Integration options: REST API, HTTP POST (Page Redirect), Hosted Checkout
- 3D Secure compliant
- No setup, monthly, or annual charges
- Real-time transaction tracking

### Credentials Required
1. `JAZZCASH_MERCHANT_ID` - Merchant identifier
2. `JAZZCASH_PASSWORD` - Merchant password
3. `JAZZCASH_HASHKEY` - Integrity salt for hash generation
4. `JAZZCASH_MPIN` - Mobile PIN

### Integration Methods

#### Hosted Checkout (Recommended)
Redirect customers to JazzCash's secure payment page - minimal development effort.

#### REST API (Direct Integration)
Full control over payment flow with custom UI/UX.

### Security
Hash generation using HMAC-SHA256:
1. Sort payment parameters alphabetically
2. Concatenate as `key=value&key=value`
3. Prefix with `integritySalt` (hashkey)
4. Generate HMAC-SHA256 hash

### Environment URLs
- **Sandbox**: https://sandbox.jazzcash.com.pk/
- **Production**: https://payments.jazzcash.com.pk/

---

## Easypaisa Integration

### Official Resources
- **Developer Portal**: https://sandbox-developer.easypaisa.com.pk/
- **Integration Guides**: https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf
- **Merchant Portal**: https://easypaisa.com.pk/online-payments-solution/

### Features
- Payment methods: Easypaisa wallet, Bank transfers (IBFT), Bill payments
- 30+ available use cases
- Self-service API Gateway
- Real-time merchant portal with instant notifications
- 24/7 support

### Credentials Required
1. `EASYPAISA_USERNAME` - API username
2. `EASYPAISA_PASSWORD` - API password
3. `EASYPAISA_STORE_ID` - Store identifier
4. `EASYPAISA_HASHKEY` - Integrity key

### Integration Process
1. Register on sandbox portal
2. Select desired APIs from use cases
3. Test in sandbox environment
4. Apply for production credentials
5. Move to production after successful testing

---

## Comparison

| Feature | JazzCash | Easypaisa |
|---------|----------|-----------|
| Credit/Debit Cards | ✅ Visa/MasterCard | ⚠️ Limited |
| Mobile Wallet | ✅ | ✅ |
| Sandbox Testing | ✅ | ✅ |
| Setup Fees | None | None |
| International Cards | ✅ | ❌ |

---

## Implementation Plan

### Phase 1: Environment Setup
- [ ] Apply for JazzCash merchant account
- [ ] Register on Easypaisa sandbox portal
- [ ] Obtain test credentials for both platforms

### Phase 2: Backend Integration
- [ ] Create payment service module (`server/paymentService.ts`)
- [ ] Implement JazzCash API client with hash generation
- [ ] Implement Easypaisa API client
- [ ] Add payment callback/webhook handlers
- [ ] Create payment status tracking in database

### Phase 3: Frontend Integration
- [ ] Add payment method selection in checkout
- [ ] Create PKR currency display with USD conversion
- [ ] Build payment confirmation flow
- [ ] Handle payment status updates

### Phase 4: Testing & Launch
- [ ] Complete sandbox testing for both gateways
- [ ] Security audit of payment flow
- [ ] Apply for production credentials
- [ ] Launch in production

---

## Currency Conversion

Current exchange rate: 1 USD = 278.50 PKR (update regularly)

Utility function available at: `client/src/lib/currency.ts`
- `convertToPKR(usdAmount)` - Convert USD to PKR
- `formatCurrency(amount, currency)` - Format for display
- `getPriceInBothCurrencies(usdAmount)` - Get both USD and PKR formatted prices
- `getPreferredCurrency(language)` - Returns PKR for Urdu, USD otherwise

---

## Environment Variables

Add these to your `.env` when ready:

```env
# JazzCash
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_HASHKEY=
JAZZCASH_MPIN=
JAZZCASH_ENVIRONMENT=sandbox # or production

# Easypaisa
EASYPAISA_USERNAME=
EASYPAISA_PASSWORD=
EASYPAISA_STORE_ID=
EASYPAISA_HASHKEY=
EASYPAISA_ENVIRONMENT=sandbox # or production
```

---

## Next Steps

1. Contact JazzCash at merchantsupport@jazzcom.com.pk for merchant account
2. Register on Easypaisa sandbox portal
3. Create payment service module once credentials are obtained
4. Test thoroughly in sandbox before production deployment
