// Extract only the first <Response>...</Response> block's inner content
export function extractResponseContent(text) {
	if (!text || typeof text !== 'string') return '';
	// Remove any <Thought> blocks entirely to be safe
	const withoutThoughts = text.replace(/<Thought>[\s\S]*?<\/Thought>/gi, '');
	const m = /<Response[^>]*>([\s\S]*?)<\/Response>/i.exec(withoutThoughts);
	if (m && m[1]) return m[1].trim();
	// Fallback: return the text with thoughts stripped
	return withoutThoughts.trim();
}