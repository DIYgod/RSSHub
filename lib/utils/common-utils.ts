import os from 'node:os';

import title from 'title';

import { config } from '@/config';
import { toInstant, toISOString } from '@/utils/time';

// convert a string into title case
const toTitleCase = (str: string) => title(str);

const rWhitespace = /\s+/;
const rAllWhitespace = /\s+/g;

// collapse all whitespaces into a single space (like "white-space: normal;" would do), and trim
const collapseWhitespace = (str?: string | null) => {
    if (str && rWhitespace.test(str)) {
        return str.replaceAll(rAllWhitespace, ' ').trim();
    }
    return str;
};

const convertDateToISO8601 = (date?: string | Temporal.Instant | number | null) => {
    if (!date) {
        return date;
    }
    const instant = toInstant(date);
    return instant && toISOString(instant);
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
    if (!config.disableIPv6) {
        address.push('[::]');
    }
    return address;
};

export { collapseWhitespace, convertDateToISO8601, getLocalhostAddress, getSubPath, toTitleCase };
