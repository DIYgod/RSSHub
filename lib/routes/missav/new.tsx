import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import { getMimeType } from 'hono/utils/mime';
import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

const urlPath = 'dm539/new';

export const route: Route = {
    path: '/new',
    categories: ['multimedia'],
    example: '/missav/new',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: [`missav.ws/${urlPath}`, 'missav.ws/new', 'missav.ws/'],
        },
        {
            source: [`missav.ai/${urlPath}`, 'missav.ai/new', 'missav.ai/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.ws/dm397/new',
};

async function fetchList(url: string) {
    try {
        return await ofetch<string>(url, { minVersion: 'TLSv1.3' });
    } catch (error) {
        if (!(error instanceof FetchError) || error.status !== 403) {
            throw error;
        }
    }

    const { page, destroy } = await getPlaywrightPage(url, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('.grid .group .text-secondary');
        return await page.content();
    } finally {
        await destroy();
    }
}

async function handler() {
    const baseUrl = 'https://missav.ws';
    const url = `${baseUrl}/${urlPath}`;

    const response = await fetchList(url);

    const $ = load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.text-secondary');
            const posterSrc = $item.find('img').attr('data-src');
            const video = $item.find('video').attr('data-src');
            const href = title.attr('href');
            if (!posterSrc || !video || !href) {
                return null;
            }
            const poster = new URL(posterSrc, url);
            const videoUrl = new URL(video, url).href;
            poster.searchParams.set('class', 'normal');
            return {
                title: title.text(),
                link: new URL(href, url).href,
                description: renderToString(
                    <video controls preload="metadata" poster={poster.href}>
                        <source src={videoUrl} type={getMimeType(new URL(videoUrl).pathname)} />
                    </video>
                ),
            };
        })
        .filter((item) => item !== null);

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
}
