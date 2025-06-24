import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:appId',
    categories: ['program-update'],
    example: '/winstall/Mozilla.Firefox',
    parameters: { appId: 'Application ID' },
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
            source: ['winstall.app/apps/:appId'],
        },
    ],
    name: 'Apps Update',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://winstall.app';
    const appId = ctx.req.param('appId');

    const buildId = await cache.tryGet(
        'winget:buildId',
        async () => {
            const { data } = await got(baseUrl);
            const $ = load(data);

            return JSON.parse($('#__NEXT_DATA__').text()).buildId;
        },
        config.cache.routeExpire,
        false
    );

    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/apps/${appId}.json`);
    const { app } = response.pageProps;
    const items = app.versions.map((item) => ({
        title: `${app.name} ${item.version}`,
        description: art(path.join(__dirname, 'templates/desc.art'), {
            installers: item.installers,
        }),
        author: app.publisher,
        category: app.tags,
        guid: `winstall:${appId}:${item.version}`,
    }));

    return {
        title: `${app.name} - winstall`,
        description: app.desc,
        link: `${baseUrl}/apps/${appId}`,
        image: `https://api.winstall.app/icons/next/${appId}.webp`,
        language: 'en',
        item: items,
    };
}
