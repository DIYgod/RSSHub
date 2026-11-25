// Searching the routes the local RSSHub has, from its /api/namespace.

import type { Namespace, Route } from '@/types';

type NamespaceData = Namespace & { routes?: Record<string, Route> };

interface Entry {
    namespace: string;
    namespaceName: string;
    /** The route's full path, with the namespace */
    path: string;
    route: Route;
    fields: Array<{ text: string; weight: number }>;
}

export interface Catalog {
    entries: Entry[];
    search: (query: string, limit: number) => Entry[];
}

const words = (text: string) =>
    text
        .toLowerCase()
        .split(/[\s,;/|]+/)
        .filter(Boolean);

const indexOf = (namespaces: Record<string, NamespaceData>): Entry[] => {
    const entries: Entry[] = [];
    for (const [namespace, data] of Object.entries(namespaces)) {
        const namespaceNames = [data.name, data.zh?.name, data.ja?.name, data['zh-TW']?.name].filter(Boolean) as string[];
        const routes = Object.entries(data.routes ?? {});
        for (const [path, route] of routes) {
            const fields = [
                { text: namespace, weight: 10 },
                ...namespaceNames.map((text) => ({ text, weight: 8 })),
                { text: data.url ?? '', weight: 6 },
                { text: route.url ?? '', weight: 6 },
                ...[route.name, route.zh?.name, route.ja?.name, route['zh-TW']?.name].map((text) => ({ text: text ?? '', weight: 5 })),
                { text: path, weight: 3 },
                { text: (route.categories ?? []).join(' '), weight: 2 },
                { text: route.description ?? '', weight: 1 },
            ];
            entries.push({
                namespace,
                namespaceName: data.name,
                path: `/${namespace}${path}`,
                route,
                fields: fields.filter((field) => field.text).map((field) => ({ text: field.text.toLowerCase(), weight: field.weight })),
            });
        }
    }
    return entries;
};

// A term counts most where it is the whole field (`github`), then at a word's start, then anywhere in it.
const scoreOf = (entry: Entry, term: string) => {
    let best = 0;
    for (const field of entry.fields) {
        let score = 0;
        if (field.text === term) {
            score = field.weight * 4;
        } else if (field.text.startsWith(term) || field.text.includes(` ${term}`) || field.text.includes(`.${term}`) || field.text.includes(`/${term}`)) {
            score = field.weight * 2;
        } else if (field.text.includes(term)) {
            score = field.weight;
        }
        best = Math.max(best, score);
    }
    return best;
};

export const createCatalog = (namespaces: Record<string, NamespaceData>): Catalog => {
    const entries = indexOf(namespaces);
    const search = (query: string, limit: number) => {
        const terms = words(query.replace(/^https?:\/\//, ''));
        if (terms.length === 0) {
            return [];
        }
        const scored: Array<{ entry: Entry; score: number; matched: number }> = [];
        for (const entry of entries) {
            let score = 0;
            let matched = 0;
            for (const term of terms) {
                const s = scoreOf(entry, term);
                score += s;
                matched += s > 0 ? 1 : 0;
            }
            if (matched > 0) {
                scored.push({ entry, score, matched });
            }
        }
        // routes that match every term; failing that, those that match the most. A route that only
        // mentions the terms in passing (its description) is left out when others match them better.
        const most = Math.max(0, ...scored.map((item) => item.matched));
        const ranked = scored.filter((item) => item.matched === most).toSorted((a, b) => b.score - a.score);
        const floor = (ranked[0]?.score ?? 0) / 4;
        return ranked
            .filter((item) => item.score >= floor)
            .slice(0, limit)
            .map((item) => item.entry);
    };
    return { entries, search };
};

const clip = (text: string, length: number) => {
    const flat = text
        .replaceAll(/:::\s*\w*/g, '')
        .replaceAll(/\s+/g, ' ')
        .trim();
    return flat.length > length ? `${flat.slice(0, length - 1)}…` : flat;
};

const parameterLines = (entry: Entry) => {
    const lines: string[] = [];
    for (const match of entry.path.matchAll(/:(\w+)(\{[^}]+\})?(\?)?/g)) {
        const [, name, , optional] = match;
        const info = entry.route.parameters?.[name];
        const description = typeof info === 'string' ? info : info?.description;
        const notes: string[] = [];
        if (optional) {
            notes.push('optional');
        }
        if (typeof info === 'object' && info.default !== undefined) {
            notes.push(`default ${info.default}`);
        }
        if (typeof info === 'object' && info.options?.length) {
            const options = info.options.slice(0, 12).map((option) => (option.label && option.label !== option.value ? `${option.value} (${option.label})` : option.value));
            notes.push(`one of ${options.join(', ')}${info.options.length > 12 ? ', …' : ''}`);
        }
        lines.push(`   - ${name}${notes.length ? ` [${notes.join('; ')}]` : ''}${description ? `: ${clip(description, 200)}` : ''}`);
    }
    return lines;
};

/** An entry as the search tool shows it: what an agent needs to build a feed's path. */
export const describe = (entry: Entry, index: number) => {
    const { route } = entry;
    const lines = [`${index}. ${entry.namespaceName} › ${route.name}`, `   path: ${entry.path}`];
    if (route.example) {
        lines.push(`   example: ${route.example}`);
    }
    const parameters = parameterLines(entry);
    if (parameters.length) {
        lines.push('   parameters:', ...parameters);
    }
    const features = route.features ?? {};
    const config = Array.isArray(features.requireConfig) ? features.requireConfig : [];
    if (config.length) {
        lines.push(`   needs config: ${config.map((item) => `${item.name}${item.optional ? ' (optional)' : ''}`).join(', ')}`);
    }
    const notes = [features.requirePuppeteer && 'needs a browser (Puppeteer)', features.antiCrawler && 'the site blocks crawlers', features.nsfw && 'NSFW'].filter(Boolean);
    if (notes.length) {
        lines.push(`   notes: ${notes.join('; ')}`);
    }
    if (route.description) {
        lines.push(`   about: ${clip(route.description, 300)}`);
    }
    return lines.join('\n');
};
