import * as cheerio from 'cheerio';

export interface SEOCardFinding {
  category: 'seo-card';
  subcategory: 'meta-tags' | 'og-tags' | 'twitter-tags' | 'image-spec' | 'ttfb' | 'semantic';
  issue: string;
  impact: string;
  priority: 'critical' | 'important' | 'optional';
  howToFix: string;
  codeExample?: string;
  passed: boolean;
}

export interface SEOCardResult {
  score: number;
  breakdown: {
    metaTags: number;
    ogTags: number;
    twitterTags: number;
    imageSpec: number;
    ttfb: number;
    semantic: number;
  };
  findings: SEOCardFinding[];
  metadata: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasOgTitle: boolean;
    hasOgDescription: boolean;
    hasOgImage: boolean;
    hasTwitterCard: boolean;
    hasCanonical: boolean;
    hasJsonLd: boolean;
    ttfbMs: number;
    ogImageDimensions: { width: number; height: number } | null;
  };
}

async function fetchImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOCardChecker/1.0)',
      },
    });
    clearTimeout(timeoutId);
    
    // We can't get dimensions from HEAD request, try to get the image
    if (response.ok) {
      const imgResponse = await fetch(imageUrl, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOCardChecker/1.0)',
        },
      });
      
      if (imgResponse.ok) {
        const buffer = await imgResponse.arrayBuffer();
        // Parse image dimensions from buffer (simple check for common formats)
        const dimensions = parseImageDimensions(new Uint8Array(buffer));
        return dimensions;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function parseImageDimensions(data: Uint8Array): { width: number; height: number } | null {
  // Check for PNG signature
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
    // PNG: width at bytes 16-19, height at bytes 20-23
    const width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
    const height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
    return { width, height };
  }
  
  // Check for JPEG signature
  if (data[0] === 0xFF && data[1] === 0xD8) {
    // JPEG: need to parse through segments to find SOF marker
    let offset = 2;
    while (offset < data.length - 8) {
      if (data[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = data[offset + 1];
      // SOF markers (except SOF4 which is DHT)
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xCF && marker !== 0xC4)) {
        const height = (data[offset + 5] << 8) | data[offset + 6];
        const width = (data[offset + 7] << 8) | data[offset + 8];
        return { width, height };
      }
      const segmentLength = (data[offset + 2] << 8) | data[offset + 3];
      offset += 2 + segmentLength;
    }
  }
  
  // Check for GIF signature
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    // GIF: width at bytes 6-7, height at bytes 8-9 (little endian)
    const width = data[6] | (data[7] << 8);
    const height = data[8] | (data[9] << 8);
    return { width, height };
  }
  
  // Check for WebP signature
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
      data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
    // WebP: VP8 chunk at byte 12+
    // Check for VP8 (lossy)
    if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x20) {
      // VP8 bitstream starts at byte 23
      const width = ((data[26] | (data[27] << 8)) & 0x3FFF);
      const height = ((data[28] | (data[29] << 8)) & 0x3FFF);
      return { width, height };
    }
    // Check for VP8L (lossless)
    if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x4C) {
      // VP8L signature byte at 21
      const signature = data[21];
      if (signature === 0x2F) {
        const bits = data[22] | (data[23] << 8) | (data[24] << 16) | (data[25] << 24);
        const width = (bits & 0x3FFF) + 1;
        const height = ((bits >> 14) & 0x3FFF) + 1;
        return { width, height };
      }
    }
  }
  
  return null;
}

export async function validateSEOCard(
  url: string,
  html: string,
  ttfbMs: number
): Promise<SEOCardResult> {
  const findings: SEOCardFinding[] = [];
  const $ = cheerio.load(html);
  
  let metaTagsScore = 100;
  let ogTagsScore = 100;
  let twitterTagsScore = 100;
  let imageSpecScore = 100;
  let ttfbScore = 100;
  let semanticScore = 100;

  // ========================================
  // 1. META TAGS (title, description)
  // ========================================
  
  const title = $('title').text().trim();
  const hasTitle = !!title;
  
  if (!title) {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: 'Missing <title> tag',
      impact: 'Search engines and social platforms cannot display a title for your page',
      priority: 'critical',
      howToFix: 'Add a <title> tag in your <head> section',
      codeExample: '<title>Your Page Title (50-60 characters)</title>',
      passed: false,
    });
    metaTagsScore -= 30;
  } else if (title.length > 60) {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: `Title too long (${title.length} chars, recommended: ≤60)`,
      impact: 'Title may be truncated in search results',
      priority: 'important',
      howToFix: 'Shorten your title to 60 characters or less',
      passed: false,
    });
    metaTagsScore -= 10;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: 'Title tag is present and well-optimized',
      impact: 'Good title length for search result display',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const hasDescription = !!metaDescription;
  
  if (!metaDescription) {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: 'Missing meta description',
      impact: 'Search engines will auto-generate a description, which may not be optimal',
      priority: 'critical',
      howToFix: 'Add a meta description tag',
      codeExample: '<meta name="description" content="Your description (150-160 characters)">',
      passed: false,
    });
    metaTagsScore -= 25;
  } else if (metaDescription.length > 160) {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: `Meta description too long (${metaDescription.length} chars, recommended: ≤160)`,
      impact: 'Description may be truncated in search results',
      priority: 'important',
      howToFix: 'Shorten your description to 160 characters or less',
      passed: false,
    });
    metaTagsScore -= 10;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'meta-tags',
      issue: 'Meta description is present and well-optimized',
      impact: 'Good description length for search result display',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  // ========================================
  // 2. OPEN GRAPH TAGS
  // ========================================
  
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  
  const hasOgTitle = !!ogTitle;
  const hasOgDescription = !!ogDescription;
  const hasOgImage = !!ogImage;

  if (!ogTitle) {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'Missing og:title tag',
      impact: 'Facebook/LinkedIn will fall back to <title> or may not display properly',
      priority: 'important',
      howToFix: 'Add an Open Graph title tag',
      codeExample: '<meta property="og:title" content="Your Page Title">',
      passed: false,
    });
    ogTagsScore -= 20;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'og:title is present',
      impact: 'Social platforms will display your custom title',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  if (!ogDescription) {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'Missing og:description tag',
      impact: 'Social platforms may not show a description or use auto-generated text',
      priority: 'important',
      howToFix: 'Add an Open Graph description tag',
      codeExample: '<meta property="og:description" content="Your description">',
      passed: false,
    });
    ogTagsScore -= 15;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'og:description is present',
      impact: 'Social platforms will display your custom description',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  let ogImageDimensions: { width: number; height: number } | null = null;
  
  // Resolve relative og:image URL to absolute
  let absoluteOgImage = ogImage;
  if (ogImage && !ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
    try {
      const parsedUrl = new URL(url);
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
      absoluteOgImage = ogImage.startsWith('/') ? `${baseUrl}${ogImage}` : `${baseUrl}/${ogImage}`;
    } catch {
      // URL parsing failed, keep original
    }
  }
  
  if (!ogImage) {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'Missing og:image tag',
      impact: 'No preview image will appear when shared on social media',
      priority: 'critical',
      howToFix: 'Add an Open Graph image tag with a 1200×630 image',
      codeExample: '<meta property="og:image" content="https://example.com/image.jpg">',
      passed: false,
    });
    ogTagsScore -= 30;
    imageSpecScore -= 40;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'og-tags',
      issue: 'og:image is present',
      impact: 'Social platforms will display your preview image',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
    
    // Check if image URL is absolute (warn if relative, but still try to fetch)
    if (!ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
      findings.push({
        category: 'seo-card',
        subcategory: 'image-spec',
        issue: 'og:image uses relative URL',
        impact: 'Social platforms may not be able to fetch the image',
        priority: 'critical',
        howToFix: 'Use an absolute URL for og:image',
        codeExample: '<meta property="og:image" content="https://yourdomain.com/image.jpg">',
        passed: false,
      });
      imageSpecScore -= 25;
    }
    
    // Try to fetch and check image dimensions using the absolute URL
    if (absoluteOgImage) {
      ogImageDimensions = await fetchImageDimensions(absoluteOgImage);
      
      if (ogImageDimensions) {
        const { width, height } = ogImageDimensions;
        const aspectRatio = width / height;
        const idealAspectRatio = 1.91;
        
        if (width === 1200 && height === 630) {
          findings.push({
            category: 'seo-card',
            subcategory: 'image-spec',
            issue: 'og:image has optimal dimensions (1200×630)',
            impact: 'Perfect size for social media previews',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
        } else if (width >= 1200 && Math.abs(aspectRatio - idealAspectRatio) < 0.1) {
          findings.push({
            category: 'seo-card',
            subcategory: 'image-spec',
            issue: `og:image dimensions ${width}×${height} (good aspect ratio)`,
            impact: 'Image will display well on social platforms',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
        } else if (width < 600 || height < 315) {
          findings.push({
            category: 'seo-card',
            subcategory: 'image-spec',
            issue: `og:image too small (${width}×${height}, recommended: 1200×630)`,
            impact: 'Image may appear blurry or be rejected by platforms',
            priority: 'important',
            howToFix: 'Use a larger image, ideally 1200×630 pixels',
            passed: false,
          });
          imageSpecScore -= 20;
        } else if (Math.abs(aspectRatio - idealAspectRatio) > 0.3) {
          findings.push({
            category: 'seo-card',
            subcategory: 'image-spec',
            issue: `og:image aspect ratio ${aspectRatio.toFixed(2)}:1 (recommended: 1.91:1)`,
            impact: 'Image may be cropped awkwardly on social platforms',
            priority: 'important',
            howToFix: 'Use 1.91:1 aspect ratio (e.g., 1200×630)',
            passed: false,
          });
          imageSpecScore -= 15;
        } else {
          findings.push({
            category: 'seo-card',
            subcategory: 'image-spec',
            issue: `og:image dimensions ${width}×${height}`,
            impact: 'Image should display adequately on social platforms',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
        }
      } else {
        findings.push({
          category: 'seo-card',
          subcategory: 'image-spec',
          issue: 'Could not verify og:image dimensions',
          impact: 'Unable to confirm image meets specifications',
          priority: 'optional',
          howToFix: 'Ensure image is 1200×630 pixels for optimal display',
          passed: true, // Don't penalize if we can't check
        });
      }
    }
  }

  // ========================================
  // 3. TWITTER CARD TAGS
  // ========================================
  
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
  const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';
  
  const hasTwitterCard = !!twitterCard;

  if (!twitterCard) {
    findings.push({
      category: 'seo-card',
      subcategory: 'twitter-tags',
      issue: 'Missing twitter:card tag',
      impact: 'Twitter/X will use default card format or OG fallback',
      priority: 'important',
      howToFix: 'Add a Twitter Card type tag',
      codeExample: '<meta name="twitter:card" content="summary_large_image">',
      passed: false,
    });
    twitterTagsScore -= 20;
  } else if (twitterCard === 'summary_large_image') {
    findings.push({
      category: 'seo-card',
      subcategory: 'twitter-tags',
      issue: 'Using summary_large_image card (optimal)',
      impact: 'Links will display with large preview image on Twitter/X',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'twitter-tags',
      issue: `Using ${twitterCard} card type`,
      impact: 'Consider using summary_large_image for better visibility',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  // ========================================
  // 4. TTFB (Time to First Byte)
  // ========================================
  
  if (ttfbMs < 300) {
    findings.push({
      category: 'seo-card',
      subcategory: 'ttfb',
      issue: `Excellent TTFB: ${ttfbMs}ms`,
      impact: 'Fast response ensures crawlers and preview generators succeed',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  } else if (ttfbMs < 800) {
    findings.push({
      category: 'seo-card',
      subcategory: 'ttfb',
      issue: `Acceptable TTFB: ${ttfbMs}ms (target: <300ms)`,
      impact: 'Social preview generation should work reliably',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
    ttfbScore -= 10;
  } else if (ttfbMs < 1500) {
    findings.push({
      category: 'seo-card',
      subcategory: 'ttfb',
      issue: `Slow TTFB: ${ttfbMs}ms (target: <800ms)`,
      impact: 'Some social platforms may timeout when generating previews',
      priority: 'important',
      howToFix: 'Optimize server response time with caching, CDN, or faster hosting',
      passed: false,
    });
    ttfbScore -= 25;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'ttfb',
      issue: `Very slow TTFB: ${ttfbMs}ms (target: <800ms)`,
      impact: 'Preview cards likely to fail on social platforms',
      priority: 'critical',
      howToFix: 'Urgently optimize server response time',
      passed: false,
    });
    ttfbScore -= 40;
  }

  // ========================================
  // 5. SEMANTIC MARKUP
  // ========================================
  
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const hasCanonical = !!canonical;
  
  if (!canonical) {
    findings.push({
      category: 'seo-card',
      subcategory: 'semantic',
      issue: 'Missing canonical URL',
      impact: 'Duplicate content issues may occur',
      priority: 'important',
      howToFix: 'Add a canonical link tag',
      codeExample: '<link rel="canonical" href="https://example.com/page">',
      passed: false,
    });
    semanticScore -= 15;
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'semantic',
      issue: 'Canonical URL is set',
      impact: 'Helps prevent duplicate content issues',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  // Check for JSON-LD structured data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const hasJsonLd = jsonLdScripts.length > 0;
  
  if (hasJsonLd) {
    findings.push({
      category: 'seo-card',
      subcategory: 'semantic',
      issue: `JSON-LD structured data found (${jsonLdScripts.length} block(s))`,
      impact: 'Rich search results and AI understanding improved',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  } else {
    findings.push({
      category: 'seo-card',
      subcategory: 'semantic',
      issue: 'No JSON-LD structured data',
      impact: 'Missing opportunity for rich search results',
      priority: 'optional',
      howToFix: 'Add JSON-LD markup for your content type',
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "description": "Page description"
}
</script>`,
      passed: false,
    });
    semanticScore -= 10;
  }

  // Calculate overall score (weighted average)
  const weights = {
    metaTags: 0.20,
    ogTags: 0.25,
    twitterTags: 0.10,
    imageSpec: 0.20,
    ttfb: 0.15,
    semantic: 0.10,
  };

  const overallScore = Math.round(
    metaTagsScore * weights.metaTags +
    ogTagsScore * weights.ogTags +
    twitterTagsScore * weights.twitterTags +
    imageSpecScore * weights.imageSpec +
    ttfbScore * weights.ttfb +
    semanticScore * weights.semantic
  );

  return {
    score: Math.max(0, Math.min(100, overallScore)),
    breakdown: {
      metaTags: Math.max(0, Math.min(100, metaTagsScore)),
      ogTags: Math.max(0, Math.min(100, ogTagsScore)),
      twitterTags: Math.max(0, Math.min(100, twitterTagsScore)),
      imageSpec: Math.max(0, Math.min(100, imageSpecScore)),
      ttfb: Math.max(0, Math.min(100, ttfbScore)),
      semantic: Math.max(0, Math.min(100, semanticScore)),
    },
    findings,
    metadata: {
      hasTitle,
      hasDescription,
      hasOgTitle,
      hasOgDescription,
      hasOgImage,
      hasTwitterCard,
      hasCanonical,
      hasJsonLd,
      ttfbMs,
      ogImageDimensions,
    },
  };
}
