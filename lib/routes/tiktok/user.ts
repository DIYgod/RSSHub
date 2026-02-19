import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { queryToBoolean } from '@/utils/readable-social';

import { renderUserEmbed } from './templates/user';
import type { Item } from './types';

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
            source: ['www.tiktok.com/:user'],
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
            let itemList = { itemList: [] };
            page.on('request', (request) => {
                ['document', 'script', 'xhr', 'fetch'].includes(request.resourceType()) ? request.continue() : request.abort();
            });
            page.on('response', async (response) => {
                const request = response.request();
                if (request.url().startsWith('https://www.tiktok.com/api/post/item_list/')) {
                    itemList = await response.json();
                }
            });
            await page.goto(`${baseUrl}/${user}`, {
                waitUntil: 'networkidle0',
            });

            const pageHtml = await page.content();
            await browser.close();

            const $ = load(pageHtml);
            const rehydrationData = JSON.parse($('script#__UNIVERSAL_DATA_FOR_REHYDRATION__').text());
            const userDetail = rehydrationData.__DEFAULT_SCOPE__['webapp.user-detail'];

            return { itemList, userDetail };
        },
        config.cache.routeExpire,
        false
    );

    const { itemList, userDetail } = data;

    const items = itemList.itemList.map((item: Item) => ({
        title: item.desc,
        description: renderUserEmbed({
            poster: item.video.cover,
            source: item.video.playAddr,
            useIframe,
            id: item.id,
        }),
        author: item.author.nickname,
        pubDate: parseDate(item.createTime, 'X'),
        link: `${baseUrl}/@${item.author.uniqueId}/video/${item.id}`,
    }));

    return {
        title: userDetail.shareMeta.title,
        description: userDetail.shareMeta.desc,
        image: userDetail.userInfo.user.avatarLarger,
        link: `${baseUrl}/${user}`,
        item: items,
    };
}
