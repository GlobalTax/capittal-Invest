export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function getCanonicalUrl(path: string = ''): string {
  return `${getBaseUrl()}${path}`;
}
