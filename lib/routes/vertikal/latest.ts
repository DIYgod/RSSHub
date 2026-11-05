import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/vertikal/latest',
    radar: [
        {
            source: ['vertikal.net/en/news', 'vertikal.net'],
        },
    ],
    name: 'News Archive',
    maintainers: ['TonyRL'],
    handler,
    url: 'vertikal.net/en/news',
};

const baseUrl = 'https://vertikal.net';

async function handler() {
    const response = await ofetch(`${baseUrl}/en/homepage/async-news-loader`, {
        query: {
            perPage: 24,
            page: 1,
        },
    });
    const $ = load(response);

    const list = $('.grid__column')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const publishedDate = $item.find('.news-teaser__date').text();
            return {
                title: $item.find('.news-teaser__title').text(),
                link: `${baseUrl}${$item.find('.news-teaser').attr('href')}`,
                pubDate: publishedDate ? parseDate(publishedDate, 'DD.MM.YYYY') : undefined,
                description: $item.find('.news-teaser__text').text(),
            };
        });

    const items = await pMap(list, getArticle, { concurrency: 3, stopOnError: false });

    return {
        title: 'News Archive | Vertikal.net',
        link: `${baseUrl}/en/news`,
        image: `${baseUrl}/apple-touch-icon-152x152.png`,
        item: items,
    };
}

async function getArticle(item: DataItem): Promise<DataItem> {
    const { description, category, pubDate } = await cache.tryGet(`vertikal:detail:v2:${item.link}`, () => fetchArticle(item.link!));
    return { ...item, description, category, pubDate: pubDate ?? item.pubDate };
}

async function fetchArticle(link: string): Promise<Pick<DataItem, 'description' | 'category' | 'pubDate'>> {
    const response = await ofetch(link);
    const $ = load(response);
    const content = $('.newsentry');
    const category = content
        .find('.newsentry__tags a')
        .toArray()
        .map((tag) => $(tag).text().trim());
    content.find('.newsentry__date, .newsentry__title, .lazyimage-placeholder, .newsentry__tags, .newsentry__share, .newsentry__comments, .newsentry__write-comment').remove();
    const publishedTime = getPublishedTime($);
    return { description: content.html() ?? '', category, pubDate: publishedTime ? parseDate(publishedTime) : undefined };
}

function getPublishedTime($: CheerioAPI): string | undefined {
    for (const script of $('script[type="application/ld+json"]').toArray()) {
        let schema: unknown;
        try {
            schema = JSON.parse($(script).text());
        } catch {
            continue;
        }
        if (!schema || typeof schema !== 'object' || !('@graph' in schema) || !Array.isArray(schema['@graph'])) {
            continue;
        }
        const article = schema['@graph'].find((entry) => entry && typeof entry === 'object' && entry['@type'] === 'Article');
        if (article && typeof article.datePublished === 'string' && article.datePublished && Number.isFinite(Date.parse(article.datePublished))) {
            return article.datePublished;
        }
    }
    return undefined;
}
