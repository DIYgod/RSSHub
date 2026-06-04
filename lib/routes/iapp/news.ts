import crypto from 'node:crypto';

import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 20;
    const baseUrl = 'https://iapp.org';
    const link = `${baseUrl}/news`;

    const { appId, apiKey, description } = await cache.tryGet('iapp:algolia-credentials', async () => {
        const html = await ofetch(link);
        const $ = load(html);
        let appId: string | undefined;
        let apiKey: string | undefined;
        $('script').each((_, el) => {
            const text = $(el).text();
            const match = text.match(/\\"appID\\":\\"(\w+)\\",\\"apiKey\\":\\"(\w+)\\"/);
            if (match) {
                appId = match[1];
                apiKey = match[2];
                return false;
            }
        });
        if (!appId || !apiKey) {
            throw new Error('Failed to extract Algolia credentials from iapp.org');
        }
        return {
            appId,
            apiKey,
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
                    facets: ['news_tags.domains.domains', 'news_tags.industry.industry', 'news_tags.law_and_regulation.law_and_regulation', 'news_tags.subject.subject'],
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

    const items = response.results[0].hits.map((hit) => ({
        title: hit.article_details.headline,
        description: hit.article_body?.map((block) => block.rte?.rich_text_editor).join('') || hit.entry_summary,
        link: new URL(hit.url, baseUrl).href,
        pubDate: parseDate(hit.article_details.date),
        author: hit.article_details.author?.map((a) => a.title).join(', '),
        category: [...(hit.news_tags?.domains?.domains || []), ...(hit.news_tags?.subject?.subject || []), ...(hit.tags_group?.internal_class || [])],
        image: hit.main_image?.url,
    }));

    return {
        title: 'IAPP - News',
        description,
        link,
        language: 'en' as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
