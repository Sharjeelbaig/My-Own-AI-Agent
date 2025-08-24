import { getDate } from "../tools/date.js";
import { search } from "../tools/search.js";
import { getCurrentTime } from "../tools/time.js";

// Helper to parse the arguments array string captured from the tag.
function parseArgs(argsGroup) {
    // argsGroup is expected to be a JSON-like array string, e.g. '["foo", "bar"]'
    // Use JSON.parse but tolerate simple single-quoted inner strings like "'foo'" -> "foo"
    const parsed = JSON.parse(argsGroup);
    if (Array.isArray(parsed)) {
        return parsed.map(a => {
            if (typeof a === 'string') {
                const s = a.trim();
                if (s.length >= 2 && s[0] === "'" && s[s.length - 1] === "'") {
                    return s.slice(1, -1);
                }
                return s;
            }
            return a;
        });
    }
    return parsed;
}

// Allowed functions map (whitelist)
const functions = {
    getCurrentTime,
    getDate,
    eval,
    search
};

export async function parseResponse(unParsedResponse) {
    const actionRegex = /<Action(?:\s+arguments=(\[[^]*?\]))?>([\s\S]*?)<\/Action>/g;

    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = actionRegex.exec(unParsedResponse)) !== null) {
        const [fullMatch, argsGroup, fnName] = match;
        result += unParsedResponse.slice(lastIndex, match.index);

        const name = (fnName || '').trim();
        const fn = functions[name];
        if (!fn) {
            result += `[Unknown function: ${name}]`;
            lastIndex = actionRegex.lastIndex;
            continue;
        }

        let args = [];
        if (argsGroup) {
            try {
                args = parseArgs(argsGroup);
            } catch (err) {
                result += `[Error parsing arguments for ${name}: ${err.message}]`;
                lastIndex = actionRegex.lastIndex;
                continue;
            }
            if (!Array.isArray(args)) args = [args];
        }

        try {
            const res = await fn(...args);
            if (res instanceof Date) result += res.toISOString();
            else if (typeof res === 'string') result += res;
            else {
                try { result += JSON.stringify(res); } catch { result += String(res); }
            }
        } catch (err) {
            result += `[Error calling ${name}: ${err.message}]`;
        }

        lastIndex = actionRegex.lastIndex;
    }

    result += unParsedResponse.slice(lastIndex);
    return result;
}