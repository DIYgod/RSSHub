import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stringifyQuery } from 'ufo';

export const getRouteNameFromPath = (path: string) => {
    const p = path.split('/').filter(Boolean);
    if (p.length > 0) {
        return p[0];
    }
    return null;
};

export const getPath = (request: Request): string => {
    // Optimized: RegExp is faster than indexOf() + slice()
    const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
    return match ? match[1] : '';
};

const humanize = (times: string[]) => {
    const [delimiter, separator] = [',', '.'];
    const orderTimes = times.map((v) => v.replaceAll(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + delimiter));
    return orderTimes.join(separator);
};

export const time = (start: number) => {
    const delta = Date.now() - start;
    return humanize([delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's']);
};

export const getCurrentPath = (metaUrl: string) => {
    const __filename = path.join(fileURLToPath(metaUrl));
    return path.dirname(__filename);
};

function isPureObject(o: any) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

export function getSearchParamsString(searchParams: any) {
    const searchParamsString = isPureObject(searchParams) ? stringifyQuery(searchParams) : null;
    return searchParamsString ?? new URLSearchParams(searchParams).toString();
}

/**
 * parse duration string to seconds
 * @param {string} timeStr - duration string like "01:01:01" / "01:01" / "59"
 * @returns {number}       - total seconds
 */
export function parseDuration(timeStr: string) {
    const clean = timeStr.trim().replaceAll(/[^\d:]/g, '');
    return clean
        .split(':')
        .reverse()
        .reduce((total, part, idx) => {
            const n = Number(part);
            if (Number.isNaN(n)) {
                throw new TypeError(`Invalid segment: ${part}`);
            }
            return total + n * Math.pow(60, idx);
        }, 0);
}
