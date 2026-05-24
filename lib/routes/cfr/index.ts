import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { commonHeaders, getDataItem } from './utils';

export const route: Route = {
    path: '/:category/:subCategory?',
    categories: ['traditional-media'],
    parameters: {
        category: 'category, find it in the URL',
        subCategory: 'sub-category, find it in the URL',
    },
    example: '/cfr/asia',
    name: 'News',
    maintainers: ['KarasuShin'],
    handler,
    radar: [
        {
            source: ['www.cfr.org/:category', 'www.cfr.org/:category/:subCategory'],
            target: '/:category/:subCategory?',
        },
    ],
    features: {
        antiCrawler: true,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const { category, subCategory } = ctx.req.param();

    const origin = 'https://www.cfr.org';
    let link = `${origin}/${category}`;
    if (subCategory) {
        link += `/${subCategory}`;
    }
    const res = await fetchCfrPage(link);

    if (res.isMarkdown) {
        const links = collectMarkdownLinks(res.data);
        const items = await pMap(links, (item) => getDataItem(item), { concurrency: 5 });

        return {
            title: getMarkdownTitle(res.data),
            link,
            item: items,
        };
    }

    const $ = load(res.data);

    const selectorMap: {
        [key: string]: string;
    } = {
        podcasts: '.episode-content__title a',
        blog: '.card-series__content-link',
        'books-reports': '.card-article__link',
    };

    const listSelector =
        selectorMap[category] ??
        [
            'a[href^="/article/"]',
            'a[href^="/articles/"]',
            'a[href^="/backgrounder/"]',
            'a[href^="/backgrounders/"]',
            'a[href^="/blog/"]',
            'a[href^="/book/"]',
            'a[href^="/event/"]',
            'a[href^="/podcasts/"]',
            'a[href^="/task-force-report/"]',
            'a[href^="/timeline/"]',
            'a[href^="/video/"]',
        ].join(',');

    const seen = new Set<string>();
    const links = $(listSelector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.attr('href');
            const $article = $item.closest('article');
            const $card = $article.length
                ? $article
                : $item
                      .parents()
                      .filter((_, element) => $(element).find('time[datetime]').length > 0)
                      .first();
            const date = $card.find('time[datetime]').first().attr('datetime');

            return {
                href,
                title: $item.text().trim() || $item.attr('aria-label') || $item.attr('title'),
                pubDate: date,
            };
        })
        .filter((item): item is { href: string; title?: string; pubDate?: string } => Boolean(item.href))
        .filter(({ href }) => {
            if (seen.has(href)) {
                return false;
            }
            seen.add(href);
            return true;
        });

    const items = await pMap(links, (item) => getDataItem(item), { concurrency: 5 });

    return {
        title: $('head title').text().replace(' | Council on Foreign Relations', ''),
        link,
        item: items,
    };
}

async function fetchCfrPage(link: string) {
    try {
        return {
            data: await ofetch(link, {
                headers: commonHeaders,
            }),
            isMarkdown: false,
        };
    } catch {
        return {
            data: await ofetch(`https://r.jina.ai/${link}`, {
                headers: {
                    ...commonHeaders,
                    'x-respond-with': 'markdown',
                    'x-target-selector': 'main',
                    'x-retain-images': 'none',
                    'x-timeout': '20',
                },
            }),
            isMarkdown: true,
        };
    }
}

function collectMarkdownLinks(markdown: string) {
    const seen = new Set<string>();
    const items: { href: string; title?: string; pubDate?: string }[] = [];
    const itemPattern = /(?:^#{1,6}\s*)?\[([^\]]+)\]\(https:\/\/www\.cfr\.org((?:\/articles|\/article|\/backgrounders|\/backgrounder|\/blog|\/book|\/event|\/podcasts|\/task-force-report|\/timeline|\/video)\/[^)#]+)\)/gm;
    const matches = [...markdown.matchAll(itemPattern)];

    for (const [index, match] of matches.entries()) {
        const [, title, href] = match;
        const start = match.index ?? 0;
        const end = matches[index + 1]?.index ?? markdown.length;
        const content = markdown.slice(start, end);
        const date = content.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/)?.[0];

        if (!seen.has(href)) {
            seen.add(href);
            items.push({
                href,
                title: title.trim(),
                pubDate: date,
            });
        }
    }

    return items;
}

function getMarkdownTitle(markdown: string) {
    return markdown.match(/^Title:\s*(.*?)\s*(?:\| Council on Foreign Relations)?$/m)?.[1] ?? 'Council on Foreign Relations';
}
