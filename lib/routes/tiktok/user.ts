import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { queryToBoolean } from '@/utils/readable-social';
import puppeteer from '@/utils/puppeteer';

const baseUrl = 'https://www.tiktok.com';

export const route: Route = {
    path: '/user/:user/:iframe?',
    categories: ['social-media'],
    example: '/tiktok/user/@linustech/true',
    parameters: { user: 'User ID, including @', iframe: 'Use the official iframe to embed the video, which allows you to view the video if the default option does not work. Default to `false`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tiktok.com/:user'],
            target: '/user/:user',
        },
    ],
    name: 'User',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { user, iframe } = ctx.req.param();
    const useIframe = queryToBoolean(iframe);

    const data = await cache.tryGet(
        `tiktok:user:${user}`,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(`${baseUrl}/${user}`, {
                waitUntil: 'networkidle0',
            });
            const SIGI_STATE = await page.evaluate(() => window.SIGI_STATE);
            await browser.close();

            const lang = SIGI_STATE.AppContext.lang;
            const SharingMetaState = SIGI_STATE.SharingMetaState;
            const ItemModule = SIGI_STATE.ItemModule;

            return { lang, SharingMetaState, ItemModule };
        },
        config.cache.routeExpire,
        false
    );

    const items = Object.values(data.ItemModule).map((item) => ({
        title: item.desc,
        description: art(path.join(__dirname, 'templates/user.art'), {
            poster: item.video.cover,
            source: item.video.playAddr,
            useIframe,
            id: item.id,
        }),
        author: item.nickname,
        pubDate: parseDate(item.createTime, 'X'),
        link: `${baseUrl}/@${item.author}/video/${item.id}`,
        category: item.textExtra.map((t) => `#${t.hashtagName}`),
    }));

    return {
        title: data.SharingMetaState.value['og:title'],
        description: data.SharingMetaState.value['og:description'],
        image: data.SharingMetaState.value['og:image'],
        link: `${baseUrl}/${user}`,
        item: items,
        language: data.lang,
    };
}
