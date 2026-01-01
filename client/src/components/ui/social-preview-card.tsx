import { useState, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";

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
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    console.log('[SocialPreviewCard] Props received:', { url, ogTitle, ogDescription, ogImage, ogSiteName, favicon });
  }, [url, ogTitle, ogDescription, ogImage, ogSiteName, favicon]);

  useEffect(() => {
    console.log('[SocialPreviewCard] ogImage changed:', ogImage, '-> resetting imageError');
    setImageError(false);
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
  const showImage = ogImage && !imageError;

  return (
    <div className="w-full max-w-lg mx-auto" data-testid="social-preview-card">
      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
        <ExternalLink className="w-3 h-3" />
        Social Media Preview
      </p>
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200">
        {showImage ? (
          <div className="w-full aspect-[1.91/1] bg-slate-100 overflow-hidden">
            <img
              src={ogImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={() => {
                console.log('[SocialPreviewCard] Image load error for:', ogImage);
                setImageError(true);
              }}
              onLoad={() => console.log('[SocialPreviewCard] Image loaded successfully:', ogImage)}
              data-testid="social-preview-image"
            />
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
