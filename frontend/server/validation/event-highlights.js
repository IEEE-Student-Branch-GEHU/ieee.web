const MAX_HIGHLIGHTS = 50;
const MAX_CAPTION_LENGTH = 300;
const MAX_HIGHLIGHT_URL_LENGTH = 2048;

const isHighlightUrl = (value) => {
  if (typeof value !== 'string' || value.length > MAX_HIGHLIGHT_URL_LENGTH
    || !/^https?:\/\//i.test(value) || /\s/.test(value)) return false;

  try {
    const url = new URL(value);
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
};

module.exports = { MAX_HIGHLIGHTS, MAX_CAPTION_LENGTH, MAX_HIGHLIGHT_URL_LENGTH, isHighlightUrl };
