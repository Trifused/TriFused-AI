import CircuitBreaker from 'opossum';

const DEFAULT_OPTIONS: CircuitBreaker.Options = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10,
  volumeThreshold: 5,
};

const breakers = new Map<string, CircuitBreaker>();

interface BreakerStats {
  name: string;
  state: string;
  stats: {
    fires: number;
    failures: number;
    fallbacks: number;
    successes: number;
    rejects: number;
    timeouts: number;
  };
}

export function createBreaker<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  options: Partial<CircuitBreaker.Options> = {}
): CircuitBreaker<Parameters<T>, ReturnType<T>> {
  const existingBreaker = breakers.get(name);
  if (existingBreaker) {
    return existingBreaker as CircuitBreaker<Parameters<T>, ReturnType<T>>;
  }

  const breaker = new CircuitBreaker(fn, {
    ...DEFAULT_OPTIONS,
    ...options,
    name,
  });

  breaker.on('open', () => {
    console.log(`[CircuitBreaker] ${name} OPENED - failing fast`);
  });

  breaker.on('halfOpen', () => {
    console.log(`[CircuitBreaker] ${name} HALF-OPEN - testing`);
  });

  breaker.on('close', () => {
    console.log(`[CircuitBreaker] ${name} CLOSED - back to normal`);
  });

  breaker.on('timeout', () => {
    console.log(`[CircuitBreaker] ${name} timeout`);
  });

  breaker.on('reject', () => {
    console.log(`[CircuitBreaker] ${name} rejected (circuit open)`);
  });

  breakers.set(name, breaker);
  return breaker as CircuitBreaker<Parameters<T>, ReturnType<T>>;
}

export function getBreaker(name: string): CircuitBreaker | undefined {
  return breakers.get(name);
}

export function getAllBreakerStats(): BreakerStats[] {
  const stats: BreakerStats[] = [];
  
  breakers.forEach((breaker, name) => {
    const s = breaker.stats;
    stats.push({
      name,
      state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
      stats: {
        fires: s.fires,
        failures: s.failures,
        fallbacks: s.fallbacks,
        successes: s.successes,
        rejects: s.rejects,
        timeouts: s.timeouts,
      },
    });
  });

  return stats;
}

export function resetBreaker(name: string): boolean {
  const breaker = breakers.get(name);
  if (breaker) {
    breaker.close();
    return true;
  }
  return false;
}

export function resetAllBreakers(): void {
  breakers.forEach((breaker) => {
    breaker.close();
  });
}

export const emailBreaker = createBreaker(
  'email',
  async (sendFn: () => Promise<any>) => sendFn(),
  { timeout: 15000, errorThresholdPercentage: 60, resetTimeout: 60000 }
);

export const stripeBreaker = createBreaker(
  'stripe',
  async (stripeFn: () => Promise<any>) => stripeFn(),
  { timeout: 20000, errorThresholdPercentage: 40, resetTimeout: 30000 }
);

export const openaiBreaker = createBreaker(
  'openai',
  async (openaiFunc: () => Promise<any>) => openaiFunc(),
  { timeout: 60000, errorThresholdPercentage: 50, resetTimeout: 60000 }
);

export const externalApiBreaker = createBreaker(
  'external_api',
  async (apiFn: () => Promise<any>) => apiFn(),
  { timeout: 10000, errorThresholdPercentage: 50, resetTimeout: 30000 }
);

export async function withCircuitBreaker<T>(
  breakerName: string,
  fn: () => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> {
  let breaker = breakers.get(breakerName);
  
  if (!breaker) {
    breaker = createBreaker(breakerName, async (f: () => Promise<any>) => f());
  }

  if (fallback) {
    breaker.fallback(fallback);
  }

  return breaker.fire(fn) as Promise<T>;
}
