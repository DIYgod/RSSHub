import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function deserializeAstroProps(val: unknown): unknown {
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
    if (val && typeof val === 'object') {
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
    keywords: string[];
    updatedAt: number;
    releasedAt: number;
    hasRepo: boolean;
    categories: string[];
    template: string | undefined;
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
        const searchResults = deserializeAstroProps(JSON.parse(props!)) as { packages: Package[] };
        const pkgs = searchResults.packages.map((item) => ({
            title: `${item.name} (${item.version}) | ${item.description}`,
            link: `https://typst.app/universe/package/${item.name}`,
            description: item.description,
            pubDate: parseDate(item.updatedAt, 'X'),
            category: item.keywords,
            author: item.authors.join(', '),
        }));

        return {
            title: 'Typst Universe',
            link: targetUrl,
            item: pkgs,
        };
    },
};
