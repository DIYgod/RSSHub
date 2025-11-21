import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import got from '@/utils/got';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const redirectCacheKey = 'phoronix:redirect';
const webArticlesCacheKey = 'phoronix:web-articles';
const articleCacheKey = 'phoronix:articles';

const baseUrl = 'https://www.phoronix.com';
const rssUrl = `${baseUrl}/rss.php`;

const feedFetch = async () => {
    const feedStr = await ofetch(rssUrl);
    const feed = await parser.parseString(feedStr);
    return {
        title: feed.title,
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

const webFetchCb = (response) => {
    const $ = load(response.body);
    return {
        title: $('title').text(),
        link: response.url,
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
        category: $('meta[name="keywords"]').attr('content').split(', '),
    };
};

const webFetch = (url) =>
    cache.tryGet(`${webArticlesCacheKey}:${url}`, async () => {
        try {
            return webFetchCb(await got(url));
        } catch (error) {
            if ((error.name === 'HTTPError' || error.name === 'FetchError') && error.response.statusCode === 404) {
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
    const webUrl = await cache.tryGet(`${redirectCacheKey}:${legacyUrl.toString()}`, async () => {
        response = await got(legacyUrl.toString());
        return response.url;
    });
    if (response) {
        const feed = webFetchCb(response);
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
    let feed;
    switch (category) {
        case 'category':
        case 'news_topic':
            feed = await legacyFetch(category, topic);
            break;
        case 'rss':
            feed = await feedFetch();
            break;
        default:
            feed = category ? await tryFetch(category, topic) : await feedFetch();
            break;
    }

    feed.item = await Promise.all(
        feed.item.map((item) =>
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
                const category = [];
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
                    let pubDateReadable = categorySelector.length && categorySelector[0].nextSibling?.nodeValue;
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
                                return page.html();
                            })
                        )
                    );
                    content.append(pages);
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
                    img.attribs.src = img.attribs.src.replace(/_med$/, '');
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
            })
        )
    );

    return feed;
}
