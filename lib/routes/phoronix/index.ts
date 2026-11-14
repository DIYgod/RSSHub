import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

dayjs.extend(utc);
dayjs.extend(timezone);

const redirectCacheKey = 'phoronix:redirect';
const webArticlesCacheKey = 'phoronix:web-articles';
const articleCacheKey = 'phoronix:articles';

const baseUrl = 'https://www.phoronix.com';
const rssUrl = `${baseUrl}/rss.php`;

type ArticleItem = {
    link?: string;
    title?: string;
    pubDate?: string;
    category?: string | string[];
};
type Listing = Omit<Data, 'item'> & { item: Array<{ link: string }> };

const feedFetch = async () => {
    const feedStr = await ofetch(rssUrl);
    const feed = await parser.parseString(feedStr);
    return {
        title: feed.title ?? 'Phoronix',
        link: feed.link,
        description: feed.description,
        item: feed.items,
        language: feed.language,
        icon: 'https://www.phoronix.com/android-chrome-192x192.png',
        image: 'https://www.phoronix.com/android-chrome-192x192.png',
        logo: 'https://www.phoronix.com/phxcms7-css/phoronix.png',
        // Copied from the web page metadata
        category: [
            'Linux Hardware Reviews',
            'Linux hardware benchmarks',
            'Linux Hardware',
            'Linux benchmarking',
            'Desktop Linux',
            'GNU/Linux benchmarks',
            'Open Source AMD',
            'Linux How To',
            'X.Org drivers',
            'Ubuntu hardware',
            'Phoronix Test Suite',
        ],
    };
};

const webFetchCb = (html: string, url: string): Listing => {
    const $ = load(html);
    return {
        title: $('title').text(),
        link: url,
        description: $('meta[name="Description"]').attr('content'),
        item: [
            ...new Set(
                $('#main a')
                    .toArray()
                    .map((e) => e.attribs.href)
            ),
        ]
            .filter((link) => link && (link.startsWith('/review/') || link.startsWith('/news/')))
            .map((link) => ({ link: `${baseUrl}${link}` })),
        language: 'en-us',
        icon: 'https://www.phoronix.com/android-chrome-192x192.png',
        image: 'https://www.phoronix.com/android-chrome-192x192.png',
        logo: 'https://www.phoronix.com/phxcms7-css/phoronix.png',
    };
};

const webFetch = (url) =>
    cache.tryGet<Listing | '404'>(`${webArticlesCacheKey}:${url}`, async () => {
        try {
            const response = await ofetch.raw<string, 'text'>(url, { responseType: 'text' });
            return webFetchCb(response._data!, response.url);
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                return '404';
            }
            throw error;
        }
    });

const legacyFetch = async (page, queryOrItem) => {
    const legacyUrl = new URL('/scan.php', baseUrl);
    legacyUrl.searchParams.set('page', page);
    if (queryOrItem) {
        if (page === 'category') {
            legacyUrl.searchParams.set('item', queryOrItem);
        } else {
            legacyUrl.searchParams.set('q', queryOrItem);
        }
    }

    let response;
    const webUrl = await cache.tryGet(`${redirectCacheKey}:${legacyUrl.href}`, async () => {
        response = await ofetch.raw<string, 'text'>(legacyUrl.href, { responseType: 'text' });
        return response.url;
    });
    if (response) {
        const feed = webFetchCb(response._data!, webUrl);
        cache.set(`${webArticlesCacheKey}:${webUrl}`, feed);
        return feed;
    }
    return await webFetch(webUrl);
};

const tryFetch = async (category, topic) => {
    const webUrl = topic ? `${baseUrl}/${category}/${topic}` : `${baseUrl}/${category}`;
    let feed = await webFetch(webUrl);
    if (feed === '404') {
        feed = await legacyFetch(category, topic);
    }
    return feed;
};

export const route: Route = {
    path: '/:category?/:topic?',
    categories: ['new-media'],
    example: '/phoronix/linux/KDE',
    parameters: {
        category: 'Category',
        topic: 'Topic. You may find available parameters from their navigator links. E.g. to subscribe to `https://www.phoronix.com/reviews/Operating+Systems`, fill in the path `/phoronix/reviews/Operating+Systems`',
    },
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
            source: ['phoronix.com/:category?/:topic?'],
        },
    ],
    name: 'News & Reviews',
    maintainers: ['oppliate', 'Rongronggg9'],
    handler,
};

async function handler(ctx) {
    const { category, topic } = ctx.req.param();
    if (!category || category === 'rss') {
        const feed = await feedFetch();
        return {
            ...feed,
            item: feed.item
                .filter((item) => item.title && item.link)
                .map((item) => ({
                    title: item.title!,
                    link: item.link,
                    description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    author: item.creator,
                    category: item.categories,
                })),
        };
    }

    const feed = category === 'category' || category === 'news_topic' ? await legacyFetch(category, topic) : await tryFetch(category, topic);
    if (feed === '404') {
        throw new Error(`Phoronix category or topic not found: ${[category, topic].filter(Boolean).join('/')}`);
    }

    const articles: Array<ArticleItem & { link: string }> = feed.item;
    const items = await pMap(
        articles,
        (item) =>
            cache.tryGet(`${articleCacheKey}:${item.link}`, async () => {
                const response = await got(item.link);
                const html = response.body;
                const $ = load(html);
                const content = $('.content');

                // Author
                const authorSelector = $('.author > a');
                // the last 2 are the category and comments
                const author = authorSelector
                    .slice(0, -2)
                    .toArray()
                    .map((e) => $(e).text());
                const category: string[] = [];
                if (item.link.includes('/news/')) {
                    category.push('News');
                } else if (item.link.includes('/review/')) {
                    category.push('Review');
                }
                const categorySelector = authorSelector.eq(-2);
                if (categorySelector.length) {
                    category.push(categorySelector.text());
                }
                let pubDate;
                if (!item.pubDate) {
                    // the text next to the category is the date
                    const dateNode = categorySelector.get(0)?.nextSibling;
                    let pubDateReadable = dateNode?.nodeType === 3 && dateNode.nodeValue;
                    if (pubDateReadable) {
                        pubDateReadable = pubDateReadable.replaceAll(/on|at|\./g, '').trim();
                        pubDate = /\d{4}$/.test(pubDateReadable)
                            ? // Only date, no time
                              // Michael Larabel lives in Indiana, USA, so we assume TZ=America/Indiana/Indianapolis
                              // https://www.phoronix.com/review/phoronix_office_2014
                              // Here we use the trick to take daylight saving into account.
                              dayjs
                                  // If we don't append "UTC" at the end,
                                  // dayjs.utc() may still parse the date in the platform (local) timezone.
                                  // E.g., if the platform timezone is UTC+8, then:
                                  // > dayjs.utc('2 Dec 2023').toString()
                                  // 'Fri, 01 Dec 2023 16:00:00 GMT'
                                  // > dayjs.utc('2 Dec 2023 UTC').toString()
                                  // 'Sat, 02 Dec 2023 00:00:00 GMT'
                                  // Append "UTC" at the end to explicitly prohibit the weird behavior.
                                  .utc(`${pubDateReadable} 08:00 UTC`)
                                  .tz('America/Indiana/Indianapolis', true)
                            : // date, time, and timezone (including daylight saving)
                              dayjs(pubDateReadable);
                        if (!pubDate.isValid()) {
                            pubDate = pubDateReadable;
                        }
                    }
                }

                // Maybe it's paginated
                const links = $('.pagination > a')
                    .toArray()
                    .map((pager) => `${baseUrl}${pager.attribs.href}`)
                    .slice(0, -1); // the last one is "next page"

                if (links.length) {
                    const pages = await Promise.all(
                        links.map((link) =>
                            cache.tryGet(link, async () => {
                                const response = await got(link);
                                const html = response.data;
                                const $$ = load(html);
                                const page = $$('.content');
                                return page.html() ?? '';
                            })
                        )
                    );
                    content.append(...pages);
                }

                const images = content.find('img');
                // Remove topic image
                const topicImage = images.first();
                if (topicImage.attr('src')?.startsWith('/assets/categories/')) {
                    const topicImageContainer = topicImage.parent();
                    if (topicImageContainer.text().trim()) {
                        topicImage.remove();
                    } else {
                        topicImageContainer.remove();
                    }
                }
                // High-res images
                images.each((_, img) => {
                    // Some pages carry a stray <img> without src (e.g. /review/ubuntu-2610-amd64v3-epyc/5)
                    if (img.attribs.src) {
                        img.attribs.src = img.attribs.src.replace(/_med$/, '');
                    }
                });

                return {
                    title: item.title || $('article h1').text(),
                    pubDate: item.pubDate || pubDate,
                    author: author.join(', '),
                    link: item.link,
                    summary: $('meta[name="twitter:description"]').attr('content'),
                    description: content.html(),
                    image: $('meta[name="twitter:image"]').attr('content'),
                    category: item.category || category,
                };
            }),
        { concurrency: 3 }
    );

    return { ...feed, item: items };
}
