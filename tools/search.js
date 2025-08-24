/**
 * search(query)
 * Perform a small web-backed search for a short summary. This uses DuckDuckGo's
 * Instant Answer API (no API key required) and falls back to a friendly message.
 *
 * Note: This function is async and returns a Promise<string>. Callers should
 * await the result: `await search('Who is Imran Khan')`.
 */

function normalize(q) {
    if (q === undefined || q === null) return '';
    return String(q).trim();
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal, ...opts });
        return res;
    } finally {
        clearTimeout(id);
    }
}

export async function search(query) {
    const q = normalize(query);
    if (!q) return 'Empty query';

    // DuckDuckGo Instant Answer API (returns JSON without requiring an API key)
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    try {
        const res = await fetchWithTimeout(ddgUrl, {}, 5000);
        if (res && res.ok) {
            const data = await res.json();
            if (data.AbstractText && data.AbstractText.trim()) {
                return data.AbstractText.trim();
            }

            // Sometimes RelatedTopics contains useful first item text
            if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length) {
                // Try to find the first topic with a Text field
                for (const t of data.RelatedTopics) {
                    if (t && typeof t.Text === 'string' && t.Text.trim()) return t.Text.trim();
                    // Some RelatedTopics are grouped with a Topics array
                    if (t && Array.isArray(t.Topics)) {
                        for (const sub of t.Topics) {
                            if (sub && typeof sub.Text === 'string' && sub.Text.trim()) return sub.Text.trim();
                        }
                    }
                }
            }
        }
    } catch (err) {
        // proceed to fallback
    }

    // Friendly fallback: a short hint with a web-search URL the user can follow
    const webSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
    return `No concise summary found. You can try: ${webSearchUrl}`;
}

// Provide a small synchronous shim for callers that prefer a string (non-blocking hint)
export function searchSync(query) {
    return 'search is async — use `await search(query)` to perform a web search.';
}
