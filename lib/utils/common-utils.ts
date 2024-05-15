import { parseDate } from '@/utils/parse-date';
import title from 'title';
import os from 'os';

// convert a string into title case
const toTitleCase = (str: string) => title(str);

const rWhiteSpace = /\s+/;
const rAllWhiteSpace = /\s+/g;

// collapse all whitespaces into a single space (like "white-space: normal;" would do), and trim
const collapseWhitespace = (str?: string | null) => {
    if (str && rWhiteSpace.test(str)) {
        return str.replaceAll(rAllWhiteSpace, ' ').trim();
    }
    return str;
};

const convertDateToISO8601 = (date?: string | Date | number | null) => {
    if (!date) {
        return date;
    }
    if (typeof date !== 'object') {
        // some routes may call `.toUTCString()` before passing the date to ctx...
        date = parseDate(date);
    }
    return date.toISOString();
};

const getSubPath = (ctx) => {
    const subPath = ctx.req.path.replace(/\/[^/]*/, '') || '/';
    return subPath;
};

const getLocalhostAddress = () => {
    const interfaces = os.networkInterfaces();
    const address = Object.keys(interfaces)
        .flatMap((name) => interfaces[name] ?? [])
        .filter((iface) => iface?.family === 'IPv4' && !iface.internal)
        .map((iface) => iface?.address)
        .filter(Boolean);
    return address;
};

export { toTitleCase, collapseWhitespace, convertDateToISO8601, getSubPath, getLocalhostAddress };
