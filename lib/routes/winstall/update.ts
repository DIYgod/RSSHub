// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `${app.name} - winstall`,
        description: app.desc,
        link: `${baseUrl}/apps/${appId}`,
        image: `https://api.winstall.app/icons/next/${appId}.webp`,
        language: 'en',
        item: items,
    });
};
