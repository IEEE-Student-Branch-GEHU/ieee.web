export class ApiResponseError extends Error {
  constructor(message, { url, status, statusText, contentType } = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.contentType = contentType;
  }
}

const responseDetails = (response) => {
  const status = Number.isFinite(response?.status) ? `HTTP ${response.status}` : 'an unknown HTTP status';
  const statusText = response?.statusText ? ` ${response.statusText}` : '';
  const contentType = response?.headers?.get?.('content-type') || 'an unknown content type';
  return { status: `${status}${statusText}`, contentType };
};

const throwUnexpectedResponse = (response, url) => {
  const details = responseDetails(response);
  throw new ApiResponseError(
    `Expected JSON from ${url}, but received ${details.contentType} (${details.status}).`,
    { url, status: response?.status, statusText: response?.statusText, contentType: details.contentType },
  );
};

/**
 * Parse an API response without attempting JSON parsing on an HTML/error body.
 * The json-only fallback keeps lightweight unit-test response doubles compatible.
 */
export const readJsonResponse = async (response, url) => {
  if (typeof response?.text === 'function') {
    const body = await response.text();
    if (!body.trim()) return null;

    try {
      return JSON.parse(body);
    } catch {
      throwUnexpectedResponse(response, url);
    }
  }

  if (typeof response?.json === 'function') {
    try {
      return await response.json();
    } catch {
      throwUnexpectedResponse(response, url);
    }
  }

  throwUnexpectedResponse(response, url);
};

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await readJsonResponse(response, url);

  if (!response.ok) {
    throw new ApiResponseError(
      data?.message || `Request to ${url} failed with HTTP ${response.status}.`,
      { url, status: response.status, statusText: response.statusText, contentType: response.headers?.get?.('content-type') },
    );
  }

  return data;
};
