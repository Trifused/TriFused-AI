const PKR_USD_RATE = 278.50;

export type CurrencyCode = 'USD' | 'PKR';

export interface FormattedPrice {
  amount: number;
  formatted: string;
  currency: CurrencyCode;
}

export function convertToPKR(usdAmount: number): number {
  return Math.round(usdAmount * PKR_USD_RATE);
}

export function convertToUSD(pkrAmount: number): number {
  return Number((pkrAmount / PKR_USD_RATE).toFixed(2));
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'PKR') {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPriceInBothCurrencies(usdAmount: number): {
  usd: FormattedPrice;
  pkr: FormattedPrice;
} {
  const pkrAmount = convertToPKR(usdAmount);
  
  return {
    usd: {
      amount: usdAmount,
      formatted: formatCurrency(usdAmount, 'USD'),
      currency: 'USD',
    },
    pkr: {
      amount: pkrAmount,
      formatted: formatCurrency(pkrAmount, 'PKR'),
      currency: 'PKR',
    },
  };
}

export function getPreferredCurrency(language: string): CurrencyCode {
  return language === 'ur' ? 'PKR' : 'USD';
}

export function formatPriceWithConversion(usdAmount: number, showBoth: boolean = false): string {
  const prices = getPriceInBothCurrencies(usdAmount);
  
  if (showBoth) {
    return `${prices.usd.formatted} (${prices.pkr.formatted})`;
  }
  
  return prices.usd.formatted;
}
