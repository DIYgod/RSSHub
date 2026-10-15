import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/developer/blog',
    categories: ['blog'],
    example: '/gs/developer/blog',
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
            source: ['developer.gs.com/blog/posts'],
            target: '/developer/blog',
        },
    ],
    name: 'Developer Blog',
    zh: {
        name: '开发者博客',
    },
    maintainers: ['chesha1'],
    handler: handlerRoute,
};

interface BlogCard {
    title: string;
    url: string;
    authors?: string;
    description?: string;
    publishedDate?: string;
}

function isBlogCard(value: unknown): value is BlogCard {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const card = value as Record<string, unknown>;
    return typeof card.title === 'string' && typeof card.url === 'string' && card.url.startsWith('/posts/');
}

function findBlogCards(value: unknown): BlogCard[] {
    if (!value || typeof value !== 'object') {
        return [];
    }
    if (Array.isArray(value)) {
        return value.flatMap(findBlogCards);
    }
    const data = value as Record<string, unknown>;
    if (Array.isArray(data.cards) && data.cards.every(isBlogCard)) {
        return data.cards;
    }
    return Object.values(data).flatMap(findBlogCards);
}

function parsePublishedDate(value: unknown) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handlerRoute(): Promise<Data> {
    const response = await ofetch('https://developer.gs.com/blog/posts');
    const $ = load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const cards = new Map(findBlogCards(nextData).map((card) => [new URL('/blog' + card.url, 'https://developer.gs.com').href, card]));
    const items = $('div[data-cy="blog-card-grid"] a')
        .toArray()
        .map((item) => {
            const link = new URL($(item).attr('href')!, 'https://developer.gs.com').href;
            const card = cards.get(link);
            if (!card) {
                throw new Error('Blog card metadata is missing for ' + link);
            }
            return {
                title: card.title,
                link,
                author: typeof card.authors === 'string' && card.authors ? card.authors : undefined,
                description: typeof card.description === 'string' ? card.description : undefined,
                pubDate: parsePublishedDate(card.publishedDate),
            };
        });

    return {
        title: 'Goldman Sachs Developer Blog',
        link: 'https://developer.gs.com/blog/posts',
        item: items,
    };
}
