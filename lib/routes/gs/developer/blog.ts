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

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isBlogCard(value: JsonValue): value is BlogCard & { [key: string]: JsonValue } {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    return typeof value.title === 'string' && typeof value.url === 'string' && value.url.startsWith('/posts/');
}

function findBlogCards(value: JsonValue): BlogCard[] {
    if (!value || typeof value !== 'object') {
        return [];
    }
    if (Array.isArray(value)) {
        return value.flatMap((entry) => findBlogCards(entry));
    }
    if (Array.isArray(value.cards) && value.cards.every(isBlogCard)) {
        return value.cards;
    }
    return Object.values(value).flatMap((entry) => findBlogCards(entry));
}

function parsePublishedDate(value?: string) {
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
