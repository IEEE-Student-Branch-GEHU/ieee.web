// Keep these limits aligned with backend/validation/event-highlights.js.
export const MAX_HIGHLIGHTS = 50;
export const MAX_CAPTION_LENGTH = 300;

export const isHighlightUrl = (value) => {
  if (typeof value !== 'string' || value.length > 2048
    || !/^https?:\/\//i.test(value) || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
};

// Legacy events have no gallery. Ignore malformed entries rather than rendering
// objects as captions or substituting a cover/unrelated photo.
export const normalizeHighlights = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(photo => photo && !Array.isArray(photo) && isHighlightUrl(photo.url))
    .slice(0, MAX_HIGHLIGHTS)
    .map(photo => ({
      url: photo.url,
      caption: typeof photo.caption === 'string' ? photo.caption.slice(0, MAX_CAPTION_LENGTH) : '',
    }));
};
