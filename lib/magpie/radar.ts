// Matches a web page's URL to RSSHub routes with RSSHub Radar's rules (/api/radar/rules/:domain),
// as the RSSHub Radar browser extension does.

import type { RadarItem } from '@/types';

interface Pattern {
    path: RegExp;
    names: string[];
    hash?: { regex: RegExp; names: string[] };
    query: Array<[key: string, value: string]>;
}

export interface RadarMatch {
    title: string;
    /** The feed's path on RSSHub, its parameters filled in from the URL */
    path: string;
    /** Parameters the target needs that the URL doesn't give */
    missing: string[];
}

const escape = (text: string) => text.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);

// A source's path, as Radar writes it (route-recognizer and Hono syntax): `:name` is a segment,
// `:name?` an optional one, `:name{regex}` a custom one, and `*` or `*name` the rest of the path.
const compilePath = (source: string) => {
    const names: string[] = [];
    let regex = '';
    const segments = source.split('/');
    for (const segment of segments) {
        if (!segment) {
            continue;
        }
        const optional = /^:(\w+)\?$/.exec(segment);
        if (optional) {
            names.push(optional[1]);
            regex += '(?:/([^/]+))?';
            continue;
        }
        let part = '';
        const token = /:(\w+)(\{[^}]+\})?([*+?])?|\*(\w*)/g;
        let last = 0;
        for (const match of segment.matchAll(token)) {
            part += escape(segment.slice(last, match.index));
            last = match.index + match[0].length;
            if (match[1]) {
                names.push(match[1]);
                const custom = match[2]?.slice(1, -1);
                const modifier = match[3];
                part += `(${custom ?? (modifier === '*' ? '.*' : modifier === '+' ? '.+' : modifier === '?' ? '[^/]*' : '[^/]+')})`;
            } else {
                names.push(match[4] || '*');
                part += '(.*)';
            }
        }
        part += escape(segment.slice(last));
        regex += `/${part}`;
    }
    return { regex: new RegExp(`^${regex}/?$`, 'i'), names };
};

const compile = (source: string): Pattern => {
    let rest = source;
    let hash: Pattern['hash'];
    const hashAt = rest.indexOf('#');
    if (hashAt !== -1) {
        const compiled = compilePath(rest.slice(hashAt + 1));
        hash = compiled;
        rest = rest.slice(0, hashAt);
    }
    // `?` starts the query when `key=` follows it; after a parameter's name it makes the parameter optional
    const queryAt = rest.search(/\?(?=[^/?#]*=)/);
    let query: Pattern['query'] = [];
    if (queryAt !== -1) {
        query = [...new URLSearchParams(rest.slice(queryAt + 1))];
        rest = rest.slice(0, queryAt);
    }
    const { regex, names } = compilePath(rest);
    return { path: regex, names, hash, query };
};

const paramsOf = (pattern: Pattern, url: URL) => {
    const params: Record<string, string> = {};
    const take = (regex: RegExp, names: string[], text: string) => {
        const match = regex.exec(text);
        if (!match) {
            return false;
        }
        for (const [i, name] of names.entries()) {
            if (match[i + 1] !== undefined && match[i + 1] !== '') {
                params[name] = match[i + 1];
            }
        }
        return true;
    };
    if (!take(pattern.path, pattern.names, url.pathname)) {
        return;
    }
    if (pattern.hash && !take(pattern.hash.regex, pattern.hash.names, url.hash.slice(1) || '/')) {
        return;
    }
    for (const [key, value] of pattern.query) {
        const actual = url.searchParams.get(key);
        if (actual === null) {
            return;
        }
        if (value.startsWith(':')) {
            params[value.slice(1).replace(/\?$/, '')] = encodeURIComponent(actual);
        } else if (value !== '*' && value !== actual) {
            return;
        }
    }
    return params;
};

// The target with the parameters put in: an optional one the URL doesn't give is left out,
// a required one is kept as `:name` and reported.
const fill = (target: string, params: Record<string, string>) => {
    const missing: string[] = [];
    const segments = target.split('/').map((segment) =>
        segment.replaceAll(/:(\w+)(\{[^}]+\})?(\?)?/g, (whole, name: string, _custom, optional) => {
            if (params[name] !== undefined) {
                return params[name];
            }
            if (optional) {
                return '';
            }
            missing.push(name);
            return `:${name}`;
        })
    );
    // drop what a missing optional parameter left empty
    const path = segments.filter((segment, i) => i === 0 || segment !== '').join('/');
    return { path, missing };
};

/** The subdomains whose rules apply to a host (`.` for none): its own, and the bare domain's for www and back. */
export const subdomainsOf = (subdomain: string) => {
    if (subdomain === 'www') {
        return ['www', '.'];
    }
    return subdomain === '.' ? ['.', 'www'] : [subdomain];
};

export const matchRadar = (url: URL, rules: RadarItem[]): RadarMatch[] => {
    const out: RadarMatch[] = [];
    const seen = new Set<string>();
    for (const rule of rules) {
        if (typeof rule.target !== 'string') {
            continue;
        }
        for (const source of rule.source) {
            const params = paramsOf(compile(source), url);
            if (!params) {
                continue;
            }
            const { path, missing } = fill(rule.target, params);
            if (!seen.has(path)) {
                seen.add(path);
                out.push({ title: rule.title ?? path, path, missing });
            }
            break;
        }
    }
    return out;
};
