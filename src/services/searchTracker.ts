/**
 * Client search tracking service helper
 * Records customer-submitted searches without recording keystrokes
 */

export const trackSearchSubmission = async (params: {
  term: string;
  productId?: string;
  resultCount?: number;
}) => {
  const cleanTerm = params.term.trim();
  if (cleanTerm.length < 2) return;

  try {
    const payload = JSON.stringify({
      term: cleanTerm,
      product_id: params.productId || undefined,
      result_count: typeof params.resultCount === 'number' ? params.resultCount : undefined,
      session_id: sessionStorage.getItem('search_session_id') || undefined
    });

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/search_track.php', blob);
    } else {
      fetch('/api/search_track.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {
        // Fail silently so customer experience is never degraded
      });
    }
  } catch (err) {
    // Fail silently
  }
};
