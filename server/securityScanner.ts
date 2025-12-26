import * as cheerio from 'cheerio';

export interface SecretFinding {
  type: string;
  pattern: string;
  value: string;
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

export interface ExposedFileFinding {
  path: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export interface SecurityScanResult {
  secretsFound: SecretFinding[];
  exposedFiles: ExposedFileFinding[];
  securityScore: number;
  scanDuration: number;
}

const SECRET_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}> = [
  {
    name: 'OpenAI API Key',
    pattern: /sk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    remediation: 'Move OpenAI API key to server-side environment variables. Never expose in client-side code.'
  },
  {
    name: 'OpenAI Project Key',
    pattern: /sk-proj-[a-zA-Z0-9_-]{80,}/g,
    severity: 'critical',
    remediation: 'Move OpenAI project key to server-side environment variables.'
  },
  {
    name: 'Stripe Secret Key',
    pattern: /sk_live_[a-zA-Z0-9]{24,}/g,
    severity: 'critical',
    remediation: 'Stripe secret keys must never be in client-side code. Use server-side API calls only.'
  },
  {
    name: 'Stripe Test Key',
    pattern: /sk_test_[a-zA-Z0-9]{24,}/g,
    severity: 'high',
    remediation: 'Even test keys should not be exposed in client-side code.'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical',
    remediation: 'AWS access keys must be server-side only. Use IAM roles or server-side SDK.'
  },
  {
    name: 'AWS Secret Key',
    pattern: /[a-zA-Z0-9/+=]{40}(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/g,
    severity: 'critical',
    remediation: 'AWS secret keys are extremely sensitive. Rotate immediately if exposed.'
  },
  {
    name: 'Supabase Service Role Key',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    severity: 'critical',
    remediation: 'Supabase service role keys bypass RLS. Must be server-side only.'
  },
  {
    name: 'Firebase API Key',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    severity: 'medium',
    remediation: 'Firebase API keys in client code should have domain restrictions configured.'
  },
  {
    name: 'Google Cloud API Key',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    severity: 'medium',
    remediation: 'Add API key restrictions in Google Cloud Console.'
  },
  {
    name: 'GitHub Token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    severity: 'critical',
    remediation: 'GitHub tokens grant repository access. Revoke and regenerate immediately.'
  },
  {
    name: 'GitHub Personal Access Token (Classic)',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    remediation: 'GitHub PATs should never be in client code. Use server-side OAuth.'
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    severity: 'high',
    remediation: 'Slack tokens grant workspace access. Rotate immediately.'
  },
  {
    name: 'Twilio API Key',
    pattern: /SK[a-f0-9]{32}/g,
    severity: 'high',
    remediation: 'Twilio keys should be server-side only to prevent abuse.'
  },
  {
    name: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: 'high',
    remediation: 'SendGrid keys allow email sending. Must be server-side only.'
  },
  {
    name: 'Mailchimp API Key',
    pattern: /[a-f0-9]{32}-us[0-9]{1,2}/g,
    severity: 'high',
    remediation: 'Mailchimp API keys should be server-side only.'
  },
  {
    name: 'Anthropic API Key',
    pattern: /sk-ant-[a-zA-Z0-9_-]{80,}/g,
    severity: 'critical',
    remediation: 'Anthropic API keys should be server-side only.'
  },
  {
    name: 'Discord Bot Token',
    pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/g,
    severity: 'critical',
    remediation: 'Discord bot tokens grant full bot access. Regenerate immediately.'
  },
  {
    name: 'Heroku API Key',
    pattern: /[h|H][e|E][r|R][o|O][k|K][u|U].{0,30}[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/gi,
    severity: 'high',
    remediation: 'Heroku API keys should be server-side environment variables.'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    remediation: 'Private keys must never be in client-side code. Store securely on server.'
  },
  {
    name: 'Database Connection String',
    pattern: /(mongodb(\+srv)?|postgres(ql)?|mysql|redis):\/\/[^\s"']+/gi,
    severity: 'critical',
    remediation: 'Database connection strings contain credentials. Server-side only.'
  },
];

const EXPOSED_FILE_PATHS = [
  { path: '/.env', type: 'Environment File', severity: 'critical' as const, description: 'Environment variables file exposed' },
  { path: '/.env.local', type: 'Environment File', severity: 'critical' as const, description: 'Local environment file exposed' },
  { path: '/.env.production', type: 'Environment File', severity: 'critical' as const, description: 'Production environment file exposed' },
  { path: '/.env.development', type: 'Environment File', severity: 'high' as const, description: 'Development environment file exposed' },
  { path: '/.git/config', type: 'Git Config', severity: 'high' as const, description: 'Git configuration exposed - may contain credentials' },
  { path: '/.git/HEAD', type: 'Git Directory', severity: 'medium' as const, description: 'Git directory exposed - repository structure visible' },
  { path: '/.gitconfig', type: 'Git Config', severity: 'medium' as const, description: 'Git user configuration exposed' },
  { path: '/config.json', type: 'Config File', severity: 'high' as const, description: 'Configuration file may contain sensitive data' },
  { path: '/config.yml', type: 'Config File', severity: 'high' as const, description: 'Configuration file may contain sensitive data' },
  { path: '/config.yaml', type: 'Config File', severity: 'high' as const, description: 'Configuration file may contain sensitive data' },
  { path: '/.htpasswd', type: 'Password File', severity: 'critical' as const, description: 'Apache password file exposed' },
  { path: '/wp-config.php', type: 'WordPress Config', severity: 'critical' as const, description: 'WordPress configuration with database credentials' },
  { path: '/phpinfo.php', type: 'PHP Info', severity: 'medium' as const, description: 'PHP configuration exposed' },
  { path: '/server-status', type: 'Server Status', severity: 'medium' as const, description: 'Apache server status page exposed' },
  { path: '/.DS_Store', type: 'macOS Metadata', severity: 'low' as const, description: 'macOS directory metadata exposed' },
  { path: '/Thumbs.db', type: 'Windows Metadata', severity: 'low' as const, description: 'Windows thumbnail cache exposed' },
  { path: '/.idea/', type: 'IDE Config', severity: 'low' as const, description: 'JetBrains IDE configuration exposed' },
  { path: '/.vscode/settings.json', type: 'IDE Config', severity: 'low' as const, description: 'VS Code settings exposed' },
  { path: '/package-lock.json', type: 'Dependency Lock', severity: 'low' as const, description: 'NPM dependency versions exposed (useful for targeting known vulnerabilities)' },
  { path: '/composer.lock', type: 'Dependency Lock', severity: 'low' as const, description: 'Composer dependency versions exposed' },
  { path: '/debug.log', type: 'Log File', severity: 'high' as const, description: 'Debug log may contain sensitive information' },
  { path: '/error.log', type: 'Log File', severity: 'high' as const, description: 'Error log may contain sensitive information' },
  { path: '/access.log', type: 'Log File', severity: 'medium' as const, description: 'Access log exposed' },
  { path: '/.aws/credentials', type: 'AWS Credentials', severity: 'critical' as const, description: 'AWS credentials file exposed' },
  { path: '/backup.sql', type: 'Database Backup', severity: 'critical' as const, description: 'Database backup exposed' },
  { path: '/database.sql', type: 'Database Backup', severity: 'critical' as const, description: 'Database dump exposed' },
  { path: '/dump.sql', type: 'Database Backup', severity: 'critical' as const, description: 'Database dump exposed' },
  { path: '/.npmrc', type: 'NPM Config', severity: 'high' as const, description: 'NPM configuration may contain auth tokens' },
  { path: '/.dockerenv', type: 'Docker', severity: 'low' as const, description: 'Docker environment indicator' },
  { path: '/Dockerfile', type: 'Docker', severity: 'low' as const, description: 'Dockerfile exposed - reveals build process' },
  { path: '/docker-compose.yml', type: 'Docker', severity: 'medium' as const, description: 'Docker compose may contain environment variables' },
];

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TriFused Security Scanner/1.0',
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function maskSecret(value: string): string {
  if (value.length <= 12) return '[REDACTED]';
  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 2);
  return `${prefix}***${suffix} (${value.length} chars)`;
}

export async function scanForSecrets(url: string, html: string): Promise<SecretFinding[]> {
  const findings: SecretFinding[] = [];
  const seenValues = new Set<string>();
  
  const $ = cheerio.load(html);
  const scripts: string[] = [];
  
  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const inlineContent = $(el).html();
    
    if (inlineContent && inlineContent.trim()) {
      scripts.push(inlineContent);
    }
  });
  
  const baseUrl = new URL(url);
  const scriptSrcs = $('script[src]').map((_, el) => $(el).attr('src')).get();
  
  for (const src of scriptSrcs.slice(0, 10)) {
    try {
      const scriptUrl = src.startsWith('http') ? src : new URL(src, baseUrl.origin).href;
      
      if (scriptUrl.includes('googletagmanager') || 
          scriptUrl.includes('google-analytics') ||
          scriptUrl.includes('cdn.') ||
          scriptUrl.includes('unpkg.com') ||
          scriptUrl.includes('cdnjs.') ||
          scriptUrl.includes('jsdelivr.')) {
        continue;
      }
      
      const response = await fetchWithTimeout(scriptUrl, 3000);
      if (response && response.ok) {
        const content = await response.text();
        if (content.length < 500000) {
          scripts.push(content);
        }
      }
    } catch {
    }
  }
  
  const allContent = scripts.join('\n') + '\n' + html;
  
  for (const patternDef of SECRET_PATTERNS) {
    const matches = allContent.match(patternDef.pattern);
    if (matches) {
      for (const match of matches) {
        if (seenValues.has(match)) continue;
        seenValues.add(match);
        
        if (match.length < 15) continue;
        if (/^[a-z]+$/i.test(match)) continue;
        if (/^[0-9]+$/.test(match)) continue;
        
        const falsePositives = [
          'example', 'placeholder', 'your-api-key', 'xxx', 'yyy', 'zzz',
          'test', 'demo', 'sample', 'fake', 'dummy', 'mock'
        ];
        const lowerMatch = match.toLowerCase();
        if (falsePositives.some(fp => lowerMatch.includes(fp))) continue;
        
        findings.push({
          type: patternDef.name,
          pattern: patternDef.pattern.source.substring(0, 30) + '...',
          value: maskSecret(match),
          location: 'JavaScript bundle or HTML',
          severity: patternDef.severity,
          remediation: patternDef.remediation,
        });
      }
    }
  }
  
  return findings;
}

export async function scanForExposedFiles(baseUrl: string): Promise<ExposedFileFinding[]> {
  const findings: ExposedFileFinding[] = [];
  const urlObj = new URL(baseUrl);
  const origin = urlObj.origin;
  
  const checkPromises = EXPOSED_FILE_PATHS.slice(0, 20).map(async (file) => {
    try {
      const checkUrl = origin + file.path;
      const response = await fetchWithTimeout(checkUrl, 3000);
      
      if (!response) return null;
      
      if (response.status === 200) {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        
        if (contentType.includes('text/html') && contentLength > 1000) {
          return null;
        }
        
        if (contentLength > 0 && contentLength < 1000000) {
          const content = await response.text();
          
          if (content.includes('<!DOCTYPE') || content.includes('<html')) {
            if (!file.path.endsWith('.html')) {
              return null;
            }
          }
          
          return {
            path: file.path,
            type: file.type,
            severity: file.severity,
            description: file.description,
            remediation: `Remove or restrict access to ${file.path}. Configure your web server to block access to sensitive files.`,
          };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  });
  
  const results = await Promise.all(checkPromises);
  findings.push(...results.filter((r): r is ExposedFileFinding => r !== null));
  
  try {
    const sourceMapPatterns = [
      '/main.js.map',
      '/bundle.js.map',
      '/app.js.map',
      '/vendor.js.map',
      '/index.js.map',
    ];
    
    for (const mapPath of sourceMapPatterns) {
      const response = await fetchWithTimeout(origin + mapPath, 2000);
      if (response && response.status === 200) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json') || contentType.includes('octet-stream')) {
          findings.push({
            path: mapPath,
            type: 'Source Map',
            severity: 'medium',
            description: 'JavaScript source map exposed - reveals original source code',
            remediation: 'Remove source maps from production or configure server to block access.',
          });
          break;
        }
      }
    }
  } catch {
  }
  
  return findings;
}

function calculateSecurityScore(secrets: SecretFinding[], exposedFiles: ExposedFileFinding[]): number {
  let score = 100;
  
  for (const secret of secrets) {
    switch (secret.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
    }
  }
  
  for (const file of exposedFiles) {
    switch (file.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 12; break;
      case 'medium': score -= 6; break;
      case 'low': score -= 2; break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

export async function runSecurityScan(url: string, html: string): Promise<SecurityScanResult> {
  const startTime = Date.now();
  
  const [secretsFound, exposedFiles] = await Promise.all([
    scanForSecrets(url, html),
    scanForExposedFiles(url),
  ]);
  
  const securityScore = calculateSecurityScore(secretsFound, exposedFiles);
  const scanDuration = Date.now() - startTime;
  
  return {
    secretsFound,
    exposedFiles,
    securityScore,
    scanDuration,
  };
}
