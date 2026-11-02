import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/daily',
    categories: ['new-media'],
    example: '/bandcamp/daily',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['daily.bandcamp.com/latest'],
            target: '/daily',
        },
    ],
    name: 'Daily',
    maintainers: ['ashi-koki'],
    handler,
    url: 'daily.bandcamp.com/latest',
    description: 'The latest Bandcamp Daily articles, with the full article text and images.',
};

async function handler(ctx) {
    const rootUrl = 'https://daily.bandcamp.com';
    const limit = getRouteLimit(ctx, 10);
    const { page, destroy } = await getPlaywrightPage(`${rootUrl}/feed`, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'domcontentloaded', timeout: config.requestTimeout },
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });

    try {
        // Non-browser clients get a Fastly JavaScript challenge instead of the page.
        await page.waitForFunction(() => (document.body?.textContent ?? '').includes('<rss'), { timeout: config.requestTimeout });

        const feedText = await fetchText(page, `${rootUrl}/feed`);
        const feed = await parser.parseString(feedText);

        const items = await pMap(
            feed.items.slice(0, limit),
            (item) =>
                cache.tryGet(item.link!, async () => {
                    const articleText = await fetchText(page, item.link!);
                    const $ = load(articleText);
                    const $article = $('article').first();
                    const image = load(item.content ?? '')('img').attr('src') ?? $('meta[property="og:image"]').attr('content');
                    const author = $article.find('article-credits a').first().text() || item.creator;

                    $article
                        .find(
                            'article-type, article-title, article-credits, article-playbutton, article-end, article-footer, .bamplayer-art, mplayer-artist, .player-wrapper, .mplayer-sidebar, aotd-ornament, img#feature-image, script, style'
                        )
                        .remove();

                    return {
                        title: item.title!,
                        link: item.link,
                        pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
                        author: author || undefined,
                        category: item.categories,
                        image,
                        description: (image ? `<img src="${image}">` : '') + ($article.html() ?? ''),
                    };
                }),
            { concurrency: 3 }
        );

        return {
            title: feed.title!,
            link: `${rootUrl}/latest`,
            description: feed.description,
            item: items,
        };
    } finally {
        await destroy();
    }
}

const fetchText = (page: Page, url: string) =>
    page.evaluate(async (u) => {
        const response = await fetch(u);
        return response.text();
    }, url);
