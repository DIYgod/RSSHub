import { fileURLToPath } from 'url';
import * as path from 'node:path';

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
