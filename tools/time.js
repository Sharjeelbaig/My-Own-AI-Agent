/**
 * Return the current time.
 * By default returns an ISO 8601 string. You can request:
 *  - 'iso'       => ISO 8601 string (default)
 *  - 'timestamp' => milliseconds since epoch (Number)
 *  - 'unix'      => seconds since epoch (Number)
 *  - 'date'      => native Date object
 *
 * @param {'iso'|'timestamp'|'unix'|'date'} [format='iso']
 * @returns {string|number|Date}
 */
export function getCurrentTime(format = 'hh:mm') {
    const now = new Date();
    switch (format) {
        case 'timestamp':
            return now.getTime();
        case 'unix':
            return Math.floor(now.getTime() / 1000);
        case 'date':
            return now;
        case 'iso':
        case 'hh:mm':
            return now.toTimeString().slice(0, 5);
        default:
            return now.toISOString();
    }
}