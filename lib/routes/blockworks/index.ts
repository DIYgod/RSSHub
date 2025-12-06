import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/blockworks',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blockworks.co/'],
            target: '/',
        },
    ],
    name: 'News',
    maintainers: ['pseudoyu'],
    handler,
    description: 'Blockworks news with full text support.',
};

async function handler(ctx): Promise<Data> {
    const rssUrl = 'https://blockworks.co/feed';
    const feed = await parser.parseURL(rssUrl);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    // Limit to 20 items
    const limitedItems = feed.items.slice(0, limit);

    const buildId = await getBuildId();

    const items = await Promise.all(
        limitedItems
            .map((item) => ({
                ...item,
                link: item.link?.split('?')[0],
            }))
            .map((item) =>
                cache.tryGet(item.link!, async () => {
                    // Get cached content or fetch new content
                    const content = await extractFullText(item.link!.split('/').pop()!, buildId);

                    return {
                        title: item.title || 'Untitled',
                        pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
                        link: item.link,
                        description: content.description || item.content || item.contentSnippet || item.summary || '',
                        author: item.author,
                        category: content.category,
                        media: content.imageUrl
                            ? {
                                  content: { url: content.imageUrl },
                              }
                            : undefined,
                    } as DataItem;
                })
            )
    );

    return {
        title: feed.title || 'Blockworks News',
        link: feed.link || 'https://blockworks.co',
        description: feed.description || 'Latest news from Blockworks',
        item: items,
        language: feed.language || 'en',
    };
}

async function extractFullText(slug: string, buildId: string): Promise<{ description: string; imageUrl: string; category: string[] }> {
    try {
        const response = await ofetch(`https://blockworks.co/_next/data/${buildId}/news/${slug}.json?slug=${slug}`);
        const article = response.pageProps.article;
        const $ = load(article.content, null, false);

        // Remove promotional content at the end
        $('hr').remove();
        $('p > em, p > strong').each((_, el) => {
            const $el = $(el);
            if ($el.text().includes('To read full editions') || $el.text().includes('Get the news in your inbox')) {
                $el.parent().remove();
            }
        });
        $('ul.wp-block-list > li > a').each((_, el) => {
            const $el = $(el);
            if ($el.attr('href') === 'https://blockworks.co/newsletter/daily') {
                $el.parent().parent().remove();
            }
        });

        return {
            description: $.html(),
            imageUrl: article.imageUrl,
            category: [...new Set([...article.categories, ...article.tags])],
        };
    } catch (error) {
        logger.error('Error extracting full text from Blockworks:', error);
        return { description: '', imageUrl: '', category: [] };
    }
}

const getBuildId = () =>
    cache.tryGet(
        'blockworks:buildId',
        async () => {
            const response = await ofetch('https://blockworks.co');
            const $ = load(response);

            return (
                $('script#__NEXT_DATA__')
                    .text()
                    ?.match(/"buildId":"(.*?)",/)?.[1] || ''
            );
        },
        config.cache.routeExpire,
        false
    ) as Promise<string>;
