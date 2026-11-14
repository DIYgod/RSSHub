import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

dayjs.extend(utc);
dayjs.extend(timezone);

const baseUrl = 'https://nltimes.nl';
const categories = {
    'top-stories': 'Top Stories',
    health: 'Health',
    crime: 'Crime',
    politics: 'Politics',
    business: 'Business',
    tech: 'Tech',
    culture: 'Culture',
    sports: 'Sports',
    weird: 'Weird',
    '1-1-2': '1-1-2',
};

const parsePublicationDate = (value?: string) => {
    if (!value?.trim()) {
        return;
    }
    const text = value.trim().replace(/^\w+, /, '');
    const format = 'D MMMM YYYY - HH:mm';
    if (Number.isFinite(parseDate(text, format, 'en', true).getTime())) {
        return dayjs.tz(text, format, 'Europe/Amsterdam').toDate();
    }
    return parseDate(value);
};

const fetchArticle = (link: string) =>
    cache.tryGet(`nltimes:body:${link}`, async () => {
        const html = await ofetch<string, 'text'>(link, { responseType: 'text' });
        const $ = load(html);
        const description = $('.news-article--body').html() ?? $('meta[property="og:description"]').attr('content');
        if (!description) {
            throw new Error(`NL Times did not return article content for ${link}.`);
        }
        return description;
    });

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/nltimes/news/top-stories',
    parameters: { category: 'category' },
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
            source: ['nltimes.nl/categories/:category'],
            target: '/news/:category',
        },
    ],
    name: 'News',
    maintainers: ['Hivol'],
    handler,
    description: `| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
| --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
| top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'top-stories';
    const categoryName = categories[category];
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unknown NL Times category: ${category}. Expected one of: ${Object.keys(categories).join(', ')}.`);
    }

    const link = category === 'top-stories' ? `${baseUrl}/top-stories` : `${baseUrl}/categories/${category}`;
    const data = {
        title: `NL Times -- ${categoryName}`,
        language: 'en' as const,
        link,
        description: `NL Times -- ${categoryName}`,
    };
    if (category === 'top-stories') {
        const feed = await parser.parseURL(`${baseUrl}/rss.xml`);
        return {
            ...data,
            item: feed.items
                .map((item) => ({
                    title: item.title ?? '',
                    link: item.link,
                    description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
                    pubDate: parsePublicationDate(item.pubDate),
                    category: item.categories,
                }))
                .filter((item) => item.title),
        };
    }

    const html = await ofetch<string, 'text'>(link, { responseType: 'text' });
    const $ = load(html);
    const list = $('.news-card')
        .toArray()
        .flatMap((entry) => {
            const card = $(entry);
            const heading = card.find('.news-card__title a').first();
            const href = heading.attr('href');
            if (!href) {
                return [];
            }
            const url = new URL(href, baseUrl);
            if (url.origin !== baseUrl) {
                return [];
            }
            const date = card.find('time').first().attr('datetime') ?? card.find('.news-card__date').first().text();
            return {
                title: heading.text(),
                link: url.href,
                pubDate: parsePublicationDate(date),
                description: card.find('.news-card__summary, .news-card__intro, .news-card__description').first().text(),
                category: card
                    .find('.news-card__categories a')
                    .toArray()
                    .map((tag) => $(tag).text()),
            };
        })
        .filter((item) => item.title)
        .slice(0, getRouteLimit(ctx, 10));

    return {
        ...data,
        item: await pMap(
            list,
            async (item) => {
                try {
                    return { ...item, description: await fetchArticle(item.link) };
                } catch {
                    return item;
                }
            },
            { concurrency: 3 }
        ),
    };
}
