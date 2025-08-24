import { getDate } from "../tools/date.js";
import { search } from "../tools/search.js";
import { bashExecute } from "../tools/bashExecute.js";
import { getCurrentTime } from "../tools/time.js";
import {executeJS} from "../tools/executeJS.js";
// Note: we intentionally do not import or expose dangerous globals like `eval`.

// Helper to parse the arguments array string captured from the tag.
function stripOuterQuotes(s) {
    if (typeof s !== 'string') return s;
    const t = s.trim();
    if (t.length >= 2 && ((t[0] === "'" && t[t.length - 1] === "'") || (t[0] === '"' && t[t.length - 1] === '"'))) {
        return t.slice(1, -1);
    }
    return t;
}

function parseArgs(argsGroup) {
    // argsGroup is expected to be a JSON-like array string, e.g. '["foo", "bar"]'
    // First, try strict JSON.parse for well-formed inputs.
    try {
        const parsed = JSON.parse(argsGroup);
        if (Array.isArray(parsed)) return parsed.map(stripOuterQuotes);
        return [parsed].map(stripOuterQuotes);
    } catch (err) {
        // Fallback: tolerant parser that extracts single- or double-quoted strings
        // or unquoted comma-separated tokens. Also split accidental shell
        // redirection patterns like "something > ./path" into two args.
        try {
            const raw = String(argsGroup).trim();
            // remove surrounding brackets if present
            const inner = raw.replace(/^\s*\[/, '').replace(/\]\s*$/, '');
            const parts = [];
            const re = /'([^']*)'|"([^"]*)"|([^,]+)/g;
            let m;
            while ((m = re.exec(inner)) !== null) {
                const val = m[1] ?? m[2] ?? m[3] ?? '';
                const s = val.trim();
                if (s.length === 0) continue;
                // If token contains a '>' redirect, split it into two tokens
                if (s.includes('>')) {
                    const [left, right] = s.split('>');
                    if (left && left.trim()) parts.push(left.trim());
                    if (right && right.trim()) parts.push(right.trim());
                    continue;
                }
                parts.push(s);
            }
            return parts.map(stripOuterQuotes);
        } catch (err2) {
            // As a last resort, return the raw string as single argument
            return [String(argsGroup)];
        }
    }
}

// Allowed functions map (whitelist)
const functions = {
    getCurrentTime,
    getDate,
    search,
    bashExecute,
    eval,
    executeJS
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