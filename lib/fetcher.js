/**
 * SWR fetcher with envelope unwrapping.
 * Automatically extracts `data` from envelope responses.
 * Throws on error envelope to trigger SWR error state.
 */

export async function fetcher(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
    error.status = res.status;
    throw error;
  }

  const envelope = await res.json();

  if (envelope.error) {
    const error = new Error(envelope.error.message);
    error.code = envelope.error.code;
    error.details = envelope.error.details;
    throw error;
  }

  return envelope.data;
}

/**
 * POST fetcher for mutation endpoints.
 */
export async function poster(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
    error.status = res.status;
    throw error;
  }

  const envelope = await res.json();

  if (envelope.error) {
    const error = new Error(envelope.error.message);
    error.code = envelope.error.code;
    error.details = envelope.error.details;
    throw error;
  }

  return envelope.data;
}
