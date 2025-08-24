/**
 * getDate(options)
 * Returns current date/time in various formats.
 *
 * Options:
 *   - format: 'iso' | 'yyyy-mm-dd' | 'locale' | 'time' | 'timestamp' | 'custom' (default: 'iso')
 *   - locale: locale string for Intl (default: system locale)
 *   - timezone: IANA timezone string for Intl (optional)
 *   - raw: if true, returns a Date object instead of a string
 *   - formatString: when format === 'custom'; supports tokens YYYY, MM, DD, hh, mm, ss
 *
 * Examples:
 *   getDate()                         -> '2025-08-24T12:34:56.789Z'
 *   getDate({ format: 'yyyy-mm-dd' }) -> '2025-08-24'
 *   getDate({ format: 'timestamp' })  -> 172xxxxxxx (number)
 *   getDate({ format: 'custom', formatString: 'YYYY/MM/DD hh:mm' })
 */

function pad(n, len = 2) {
    return String(n).padStart(len, '0');
}

function formatCustom(date, fmt) {
    return fmt
        .replace(/YYYY/g, date.getFullYear())
        .replace(/MM/g, pad(date.getMonth() + 1))
        .replace(/DD/g, pad(date.getDate()))
        .replace(/hh/g, pad(date.getHours()))
        .replace(/mm/g, pad(date.getMinutes()))
        .replace(/ss/g, pad(date.getSeconds()));
}

export function getDate(options = {}) {
    const {
        format = 'iso',
        locale,
        timezone,
        raw = false,
        formatString = 'YYYY-MM-DD hh:mm:ss',
    } = options;

    const now = new Date();

    if (raw) return now;

    if (format === 'timestamp') return now.getTime();

    if (format === 'iso') return now.toISOString();

    if (format === 'yyyy-mm-dd') {
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }

    if (format === 'time') {
        return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    if (format === 'custom') {
        return formatCustom(now, formatString);
    }

    if (format === 'locale') {
        const opts = { timeZone: timezone };
        // Remove undefined keys to let Intl pick defaults
        Object.keys(opts).forEach(k => opts[k] === undefined && delete opts[k]);
        return new Intl.DateTimeFormat(locale, opts).format(now);
    }

    // Fallback to ISO
    return now.toISOString();
}