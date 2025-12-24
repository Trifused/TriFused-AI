import * as cheerio from 'cheerio';

// Route-specific meta tag configurations for SEO
export const routeMetaTags: Record<string, { title: string; description: string }> = {
  '/grader': {
    title: 'Free Website Grader | TriFused',
    description: 'Free website grader tool. Analyze your site for SEO, security, performance, accessibility, and email security. Get actionable improvement tips.',
  },
  '/report': {
    title: 'Website Grade Report | TriFused',
    description: 'View your website grade report with detailed SEO, security, performance, and accessibility analysis.',
  },
};

export function applyRouteMeta(html: string, url: string): string {
  // Get path without query string
  const route = url.split('?')[0];
  
  // Find matching route
  const matchedRoute = Object.keys(routeMetaTags).find(r => route.startsWith(r));
  if (!matchedRoute) return html;
  
  const meta = routeMetaTags[matchedRoute];
  
  // Preserve DOCTYPE before parsing (cheerio strips it)
  const doctypeMatch = html.match(/^<!DOCTYPE[^>]*>/i);
  const doctype = doctypeMatch ? doctypeMatch[0] : '<!DOCTYPE html>';
  
  // Use cheerio for robust HTML parsing
  const $ = cheerio.load(html);
  
  // Update title
  $('title').text(meta.title);
  
  // Update meta description
  $('meta[name="description"]').attr('content', meta.description);
  
  // Update Open Graph tags
  $('meta[property="og:title"]').attr('content', meta.title);
  $('meta[property="og:description"]').attr('content', meta.description);
  
  // Update Twitter tags
  $('meta[name="twitter:title"]').attr('content', meta.title);
  $('meta[name="twitter:description"]').attr('content', meta.description);
  
  // Return with DOCTYPE preserved
  return doctype + '\n' + $.html();
}
