// Helper utility to get the public shareable URL for clients and trainees
// In AI Studio, 'ais-dev-' is private to the developer (causes 401 for anyone else).
// 'ais-pre-' is the public shared URL accessible to anyone without login.

export function getPublicShareUrl(): string {
  if (typeof window === 'undefined') return '';
  let url = window.location.origin + window.location.pathname;
  if (url.includes('ais-dev-')) {
    url = url.replace('ais-dev-', 'ais-pre-');
  }
  // Remove any trailing slash if not root
  return url;
}

export function getCoachDirectUrl(): string {
  const base = getPublicShareUrl();
  return `${base}?coach=true`;
}
