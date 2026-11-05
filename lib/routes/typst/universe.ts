import { load } from 'cheerio';
import { escapeText } from 'entities';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function deserializeAstroProps(val: any): any {
    if (Array.isArray(val)) {
        const tag = val[0];
        if (tag === 0) {
            return val.length > 1 ? deserializeAstroProps(val[1]) : undefined;
        }
        if (tag === 1) {
            return val[1].map((item) => deserializeAstroProps(item));
        }
        return val.map((item) => deserializeAstroProps(item));
    }
    if (val instanceof Object) {
        const result = {};
        for (const [key, v] of Object.entries(val)) {
            result[key] = deserializeAstroProps(v);
        }
        return result;
    }
    return val;
}

interface Package {
    name: string;
    version: string;
    authors: string[];
    license: string;
    description: string;
    keywords?: string[];
    updatedAt?: number;
    releasedAt: number;
    hasRepo: boolean;
    categories?: string[];
    template: string | undefined;
}

interface SearchResults {
    packages: Package[];
}

function getPublicationDate(value: number | undefined): Date | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return;
    }
    const date = parseDate(value, 'X');
    return Number.isFinite(date.getTime()) ? date : undefined;
}

export const route: Route = {
    path: '/universe',
    categories: ['program-update'],
    example: '/typst/universe',
    radar: [
        {
            source: ['typst.app/universe'],
            target: '/universe',
        },
    ],
    name: 'Universe',
    maintainers: ['HPDell'],
    handler: async () => {
        const targetUrl = 'https://typst.app/universe/search';
        const page = await ofetch(targetUrl);
        const $ = load(page);
        const props = $('astro-island[component-export="SearchResults"]').attr('props');
        const searchResults: SearchResults = deserializeAstroProps(JSON.parse(props!));
        const pkgs = searchResults.packages.map((item) => ({
            title: `${item.name} (${item.version}) | ${item.description}`,
            link: `https://typst.app/universe/package/${item.name}`,
            description: escapeText(item.description),
            pubDate: getPublicationDate(item.updatedAt),
            category: [...new Set([...(item.keywords ?? []), ...(item.categories ?? [])])],
            author: item.authors.join(', '),
        }));

        return {
            title: 'Typst Universe',
            link: targetUrl,
            item: pkgs,
        };
    },
};
