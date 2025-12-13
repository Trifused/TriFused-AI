import { useEffect, useRef, useCallback } from 'react';

interface ClickEvent {
  element: string;
  timestamp: number;
  path: string;
}

interface SessionData {
  clickPath: ClickEvent[];
  pageViews: string[];
  startTime: number;
  utmParams: Record<string, string>;
}

const SESSION_KEY = 'trifused_session_data';

function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
}

function loadSessionData(): SessionData {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load session data:', e);
  }
  
  return {
    clickPath: [],
    pageViews: [],
    startTime: Date.now(),
    utmParams: getUtmParams(),
  };
}

function saveSessionData(data: SessionData): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save session data:', e);
  }
}

export function useSessionTracking() {
  const sessionDataRef = useRef<SessionData>(loadSessionData());

  useEffect(() => {
    const currentPath = window.location.pathname;
    const data = sessionDataRef.current;
    
    if (!data.pageViews.includes(currentPath)) {
      data.pageViews.push(currentPath);
      saveSessionData(data);
    }
    
    if (Object.keys(data.utmParams).length === 0) {
      const newUtmParams = getUtmParams();
      if (Object.keys(newUtmParams).length > 0) {
        data.utmParams = newUtmParams;
        saveSessionData(data);
      }
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = target.closest('button, a, [role="button"], input[type="submit"]');
      if (!isInteractive) return;

      const elementInfo = 
        target.getAttribute('data-testid') ||
        target.textContent?.slice(0, 50) ||
        target.tagName.toLowerCase();

      const clickEvent: ClickEvent = {
        element: elementInfo,
        timestamp: Date.now(),
        path: window.location.pathname,
      };

      const data = sessionDataRef.current;
      data.clickPath.push(clickEvent);
      
      if (data.clickPath.length > 100) {
        data.clickPath = data.clickPath.slice(-100);
      }
      
      saveSessionData(data);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  const getSessionData = useCallback(() => {
    return {
      clickPath: sessionDataRef.current.clickPath,
      pageViews: sessionDataRef.current.pageViews,
      sessionDuration: Date.now() - sessionDataRef.current.startTime,
      utmParams: sessionDataRef.current.utmParams,
    };
  }, []);

  const trackClick = useCallback((elementName: string) => {
    const clickEvent: ClickEvent = {
      element: elementName,
      timestamp: Date.now(),
      path: window.location.pathname,
    };
    
    const data = sessionDataRef.current;
    data.clickPath.push(clickEvent);
    saveSessionData(data);
  }, []);

  return { getSessionData, trackClick };
}
