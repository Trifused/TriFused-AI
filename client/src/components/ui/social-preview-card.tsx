import { useState, useEffect } from "react";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

interface SocialPreviewCardProps {
  url: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogSiteName?: string | null;
  favicon?: string | null;
}

export function SocialPreviewCard({
  url,
  ogTitle,
  ogDescription,
  ogImage,
  ogSiteName,
  favicon,
}: SocialPreviewCardProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [faviconError, setFaviconError] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  // Preload image in background using proxy to bypass CORS
  useEffect(() => {
    if (!ogImage) {
      setImageStatus('error');
      setLoadedImageUrl(null);
      return;
    }

    setImageStatus('loading');
    
    // Use proxy for external images to bypass CORS restrictions
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(ogImage)}`;
    const img = new Image();
    
    // Set a timeout for slow-loading images
    const timeoutId = setTimeout(() => {
      console.log('[SocialPreviewCard] Image load timeout for:', ogImage);
      setImageStatus('error');
    }, 15000); // 15 second timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      console.log('[SocialPreviewCard] Image preloaded successfully via proxy:', ogImage);
      setLoadedImageUrl(proxyUrl);
      setImageStatus('loaded');
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      console.log('[SocialPreviewCard] Proxy image load error, trying direct URL:', ogImage);
      // Fallback to direct URL if proxy fails
      const directImg = new Image();
      directImg.onload = () => {
        console.log('[SocialPreviewCard] Direct image load successful:', ogImage);
        setLoadedImageUrl(ogImage);
        setImageStatus('loaded');
      };
      directImg.onerror = () => {
        console.log('[SocialPreviewCard] Direct image load also failed:', ogImage);
        setImageStatus('error');
        setLoadedImageUrl(null);
      };
      directImg.src = ogImage;
    };

    img.src = proxyUrl;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [ogImage]);

  useEffect(() => {
    setFaviconError(false);
  }, [favicon]);

  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  })();

  const displayTitle = ogTitle || domain;
  const displayDescription = ogDescription || '';
  const displaySiteName = ogSiteName || domain;

  return (
    <div className="w-full max-w-lg mx-auto" data-testid="social-preview-card">
      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
        <ExternalLink className="w-3 h-3" />
        Social Media Preview
      </p>
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200">
        {imageStatus === 'loaded' && loadedImageUrl ? (
          <div className="w-full aspect-[1.91/1] bg-slate-100 overflow-hidden">
            <img
              src={loadedImageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover"
              data-testid="social-preview-image"
            />
          </div>
        ) : imageStatus === 'loading' ? (
          <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
              <p className="text-xs">Loading preview...</p>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No preview image available</p>
            </div>
          </div>
        )}
        <div className="p-3 bg-[#f2f3f5]">
          <div className="flex items-center gap-2 mb-1">
            {favicon && !faviconError ? (
              <img
                src={favicon}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={() => setFaviconError(true)}
                data-testid="social-preview-favicon"
              />
            ) : (
              <Globe className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs text-[#65676b] uppercase tracking-wide">
              {displaySiteName}
            </span>
          </div>
          <h3 className="text-[#1c1e21] font-semibold text-sm leading-tight mb-1 line-clamp-2" data-testid="social-preview-title">
            {displayTitle}
          </h3>
          {displayDescription && (
            <p className="text-[#65676b] text-xs leading-snug line-clamp-2" data-testid="social-preview-description">
              {displayDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
