import { useCallback } from 'react';

// Analytics event tracking hook (stub implementation)

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    // TODO: Integrate analytics service (Google Analytics, Segment, Mixpanel, etc.)
    // Example: gtag('event', eventName, properties)
  }, []);

  const trackCTAClick = useCallback((ctaName: string, location: string) => {
    trackEvent("cta_clicked", {
      cta_name: ctaName,
      page_location: location,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackPageView = useCallback((pageName: string) => {
    trackEvent("page_viewed", {
      page_name: pageName,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackCTAClick,
    trackPageView,
  };
};
