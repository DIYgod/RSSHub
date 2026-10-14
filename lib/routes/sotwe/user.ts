import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { PRESETS } from '@/utils/header-generator';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media'],
    example: '/sotwe/user/_RSSHub',
    parameters: {
        id: 'Twitter username',
    },
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
            source: ['www.sotwe.com/:id'],
            target: '/user/:id',
        },
    ],
    name: 'User timeline',
    maintainers: ['TonyRL'],
    handler,
    view: ViewType.Pictures,
};

const renderMedia = (mediaEntities) =>
    mediaEntities
        .map((e) => {
            switch (e.type) {
                case 'photo':
                    return `<img src="${e.mediaURL}">`;
                case 'video': {
                    const video = e.videoInfo.variants.filter((v) => v.type === 'video/mp4').toSorted((a, b) => b.bitrate - a.bitrate)[0];
                    return `<video controls preload="metadata" poster="${e.mediaURL}"><source src="${video.url}" type="video/mp4"></video>`;
                }
                default:
                    return '';
            }
        })
        .join('<br>');

const renderDescription = (item) =>
    `${renderMedia(item.mediaEntities)}<br>${item.text.replaceAll('\n', '<br>')}${item.quotedStatus ? `<br>${renderDescription(item.quotedStatus)}` : ''}${item.retweetedStatus ? `<br>${renderDescription(item.retweetedStatus)}` : ''}`;

async function handler(ctx) {
    const baseUrl = 'https://www.sotwe.com';
    const { id } = ctx.req.param();

    const data = await cache.tryGet(
        `sotwe:user:${id}`,
        async () => {
            const apiUrl = `${baseUrl}/api/v3/user/${id}/`;
            try {
                return await ofetch(apiUrl, {
                    headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME,
                    headers: { accept: 'application/json' },
                    retry: 0,
                });
            } catch {
                //
            }
            const { page, destroy } = await getPlaywrightPage(apiUrl, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (route) => {
                        const request = route.request();
                        ['document', 'script', 'xhr', 'fetch'].includes(request.resourceType()) ? route.continue() : route.abort();
                    });
                },
            });
            try {
                logger.http(`Requesting ${apiUrl}`);
                const browserResponse = await page.goto(apiUrl, {
                    waitUntil: 'domcontentloaded',
                });
                if (!browserResponse?.ok()) {
                    throw new Error(`Sotwe API request failed with HTTP ${browserResponse?.status() ?? 'no response'}. Check whether ${apiUrl} is accessible from this RSSHub instance.`);
                }
                const response = await page.evaluate(() => document.documentElement.textContent);

                return JSON.parse(response || '{}');
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    const items = data.data.map((item) => ({
        title: sanitizeHtml(item.text.split('\n', 1)[0], { allowedTags: [], allowedAttributes: {} }),
        description: renderDescription(item),
        link: `https://x.com/${id}/status/${item.id}`,
        pubDate: parseDate(item.createdAt, 'x'),
    }));

    return {
        title: `${data.info.name} @${data.info.screenName} - Twitter Profile | Sotwe`,
        description: data.info.description,
        link: `${baseUrl}/${id}`,
        image: data.info.profileImageThumbnail,
        item: items,
    };
}
