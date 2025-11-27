import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

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
    name: 'User timeline - Sotwe',
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
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                ['document', 'script', 'xhr', 'fetch'].includes(request.resourceType()) ? request.continue() : request.abort();
            });
            const apiUrl = `${baseUrl}/api/v3/user/${id}/`;
            logger.http(`Requesting ${apiUrl}`);
            await page.goto(apiUrl, {
                waitUntil: 'domcontentloaded',
            });
            const response = await page.evaluate(() => document.documentElement.textContent);
            await page.close();
            await browser.close();

            return JSON.parse(response || '{}');
        },
        config.cache.routeExpire,
        false
    );

    const items = data.data.map((item) => ({
        title: sanitizeHtml(item.text.split('\n')[0], { allowedTags: [], allowedAttributes: {} }),
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
