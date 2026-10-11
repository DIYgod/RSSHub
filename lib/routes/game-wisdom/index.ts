import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const BASE_URL = 'https://game-wisdom.com';

const CATEGORIES = {
    analysis: 'Analysis',
    critical: 'Critical Pieces',
    general: 'General',
    guest: 'Guest Pieces',
    podcast: 'Podcast',
    series: 'Series',
    spotlight: 'Spotlight',
    videos: 'Videos',
};

const parseArticle = async (link: string, excerpt?: string): Promise<Pick<DataItem, 'description' | 'image'>> => {
    try {
        return await cache.tryGet(link, async () => {
            const html = await ofetch(link);
            const $ = load(html);
            const content = $('.article-content > .clearfix');
            if (content.length === 0) {
                throw new Error(`Game Wisdom article body not found: ${link}`);
            }

            content.find('.share-container, .addthis_tool').remove();
            // The site's YouTube embeds leak their attributes into the iframe as text.
            content.find('iframe').empty();
            content.find('.wp-caption-text').each((_, el) => {
                $(el).replaceWith($('<figcaption>').append($(el).contents()));
            });
            content.find('.wp-caption').each((_, el) => {
                $(el).replaceWith($('<figure>').append($(el).contents()));
            });

            return {
                description: content.html() ?? undefined,
                // The lead image is a CSS background outside the article body.
                image: $('#hero-post-container')
                    .attr('style')
                    ?.match(/url\(['"]?([^'"()]+)['"]?\)/)?.[1],
            };
        });
    } catch {
        // Fall back to the official excerpt, uncached, when the article page cannot be parsed.
        return { description: excerpt };
    }
};

const handler = async (ctx: Context): Promise<Data> => {
    const category = ctx.req.param('category');
    if (category && !Object.hasOwn(CATEGORIES, category)) {
        throw new InvalidParameterError(`Unknown Game Wisdom category: ${category}. Use one of: ${Object.keys(CATEGORIES).join(', ')}, or omit the parameter for the latest articles.`);
    }

    const link = category ? `${BASE_URL}/category/${category}` : BASE_URL;
    const xml = await ofetch(`${link}/feed`, { responseType: 'text' });
    const feed = await parser.parseString(xml);

    const items = await pMap(
        feed.items,
        async (item): Promise<DataItem> => ({
            title: item.title!,
            link: item.link,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            author: item.creator,
            category: item.categories,
            ...(await parseArticle(item.link!, item.content)),
        }),
        { concurrency: 2 }
    );

    return {
        title: feed.title!,
        description: feed.description,
        link,
        language: 'en',
        item: items,
    };
};

export const route: Route = {
    path: '/:category?',
    name: 'Articles',
    url: 'game-wisdom.com',
    maintainers: ['mcdp-adk'],
    handler,
    example: '/game-wisdom',
    parameters: {
        category: {
            description: 'Category. Omit for the latest articles.',
            options: Object.entries(CATEGORIES).map(([value, label]) => ({ value, label })),
        },
    },
    description: "Game Wisdom's official RSS feeds only include excerpts. This route fetches the full article body from each article page.",
    categories: ['game'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['game-wisdom.com/'],
            target: '/',
        },
        {
            source: ['game-wisdom.com/category/:category'],
            target: '/:category',
        },
    ],
    view: ViewType.Articles,
};
