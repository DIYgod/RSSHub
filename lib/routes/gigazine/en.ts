import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://gigazine.net';
const LIST_URL = `${ROOT_URL}/gsc_news/en/`;

// Full Chrome headers reduce Cloudflare rate-limit sensitivity
const CHROME_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const route: Route = {
    path: '/en',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/gigazine/en',
    name: 'English News',
    url: 'gigazine.net/gsc_news/en/',
    maintainers: ['chansantheman'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gigazine.net/gsc_news/en/', 'gigazine.net/gsc_news/en'],
            target: '/en',
        },
    ],
    handler,
    description: 'Full-text English articles from GIGAZINE. The first load is slow due to sequential fetching required by the site rate limits; subsequent loads are served from cache.',
};

async function handler() {
    const html = await ofetch(LIST_URL, {
        headers: { ...CHROME_HEADERS, Referer: ROOT_URL },
    });
    const $ = load(html);

    const list = $('.card')
        .toArray()
        .map((el) => {
            const card = $(el);
            const anchor = card.find('h2 a');
            const path = anchor.attr('href') ?? '';
            const link = path.startsWith('http') ? path : `${ROOT_URL}${path}`;
            const title = anchor.find('span').text().trim();
            const pubDate = parseDate(card.find('time').attr('datetime') ?? '');
            const category = card.find('.catab').text().trim();
            const image = card.find('.thumb img').attr('src') ?? '';

            return { title, link, pubDate, category, image } as DataItem & { category: string; image: string };
        })
        .filter((item) => item.title && item.link);

    const items: DataItem[] = [];

    for (const item of list) {
        let full: DataItem;
        try {
            // eslint-disable-next-line no-await-in-loop
            full = (await cache.tryGet(item.link!, async () => {
                // Sequential delay to stay under Cloudflare's rate limit between cache-miss fetches
                await delay(5000);

                const articleHtml = await ofetch(item.link!, {
                    headers: { ...CHROME_HEADERS, Referer: LIST_URL },
                });
                const $$ = load(articleHtml);

                // Remove ads, scripts, and trackers
                $$('#article script, #article .sbn, #article noscript').remove();

                const content = $$('#article .cntimage');
                // Title and timestamp are already in RSS metadata
                content.find('h1.title').remove();
                content.find('time.yeartime').remove();

                // Make image src absolute and prevent hotlink blocking
                content.find('img').each((_, img) => {
                    const src = $$(img).attr('src');
                    if (src?.startsWith('//')) {
                        $$(img).attr('src', `https:${src}`);
                    }
                    $$(img).attr('referrerpolicy', 'no-referrer');
                });

                // Make internal links absolute
                content.find('a[href]').each((_, a) => {
                    const href = $$(a).attr('href');
                    if (href?.startsWith('/')) {
                        $$(a).attr('href', `${ROOT_URL}${href}`);
                    }
                });

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    category: [item.category as string],
                    image: item.image as string,
                    description: content.html()?.trim() ?? '',
                } as DataItem;
            })) as DataItem;
        } catch {
            full = {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                category: [item.category as string],
                image: item.image as string,
            } as DataItem;
        }

        items.push(full);
    }

    return {
        title: 'GIGAZINE - English News',
        link: LIST_URL,
        item: items,
    };
}
