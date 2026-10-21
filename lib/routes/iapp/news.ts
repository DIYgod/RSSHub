import crypto from 'node:crypto';

import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/iapp/news',
    radar: [
        {
            source: ['iapp.org/news'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'iapp.org/news',
};

const extractSearchConfig = (source: string) => {
    const embedded = source.match(/\\"appID\\":\\"(\w+)\\",\\"apiKey\\":\\"(\w+)\\"/);
    const client = source.includes('algolia.net') ? source.match(/\(["']([A-Z0-9]{10})["'],["']([a-f0-9]{32})["']\)/) : undefined;
    const match = embedded ?? client;
    return match ? { appId: match[1], apiKey: match[2] } : undefined;
};

async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 20);
    const baseUrl = 'https://iapp.org';
    const link = `${baseUrl}/news`;

    const { appId, apiKey, description } = await cache.tryGet('iapp:algolia-credentials', async () => {
        const html = await ofetch(link);
        const $ = load(html);
        let searchConfig = extractSearchConfig(html);
        if (!searchConfig) {
            const scripts = $('script[src]')
                .toArray()
                .map((el) => new URL($(el).attr('src')!, baseUrl))
                .filter((url) => url.origin === baseUrl && url.pathname.startsWith('/_next/static/'));
            const configurations = await pMap(scripts, async (url) => extractSearchConfig(await ofetch<string, 'text'>(url.href, { responseType: 'text' })), { concurrency: 3 });
            searchConfig = configurations.find((configuration) => configuration !== undefined);
        }
        if (!searchConfig) {
            throw new Error('Failed to extract the public Algolia search configuration from iapp.org');
        }
        return {
            ...searchConfig,
            description: $('meta[name="description"]').attr('content'),
        };
    });

    const response = await ofetch(`https://${appId.toLowerCase()}-dsn.algolia.net/1/indexes/*/queries`, {
        method: 'POST',
        query: {
            'x-algolia-api-key': apiKey,
            'x-algolia-application-id': appId,
        },
        headers: {
            Referer: `${baseUrl}/`,
        },
        body: {
            requests: [
                {
                    indexName: 'all_article_date_desc',
                    clickAnalytics: true,
                    facets: ['domains.domains', 'industry.industry', 'law_and_regulation.law_and_regulation', 'subject.subject'],
                    filters: '_content_type:news_article',
                    highlightPostTag: '__/ais-highlight__',
                    highlightPreTag: '__ais-highlight__',
                    hitsPerPage: limit,
                    maxValuesPerFacet: 200,
                    page: 0,
                    query: '',
                    userToken: `anonymous-${crypto.randomUUID()}`,
                },
            ],
        },
    });

    const items = response.results[0].hits.map((hit) => {
        const date = hit.article_details.date;
        const pubDate = typeof date === 'string' ? parseDate(date, 'YYYY-MM-DD', true) : undefined;
        const tags = hit.news_tags ?? hit;
        return {
            title: hit.article_details.headline,
            description: hit.article_body?.map((block) => block.rte?.rich_text_editor).join('') || hit.entry_summary,
            link: new URL(hit.url, baseUrl).href,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? timezone(pubDate, 0) : undefined,
            author: hit.article_details.author?.map((a) => a.title).join(', '),
            category: [
                ...new Set([...(tags.domains?.domains || []), ...(tags.subject?.subject || []), ...(tags.industry?.industry || []), ...(tags.law_and_regulation?.law_and_regulation || []), ...(hit.tags_group?.internal_class || [])]),
            ],
            image: hit.main_image?.url,
        };
    });

    return {
        title: 'IAPP - News',
        description,
        link,
        language: 'en' as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
