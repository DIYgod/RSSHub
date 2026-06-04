import { load } from 'cheerio';

import type { Route } from '@/types';
import cacheGeneral from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/user/article/:uid',
    categories: ['social-media'],
    example: '/bilibili/user/article/334958638',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到' },
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
            source: ['space.bilibili.com/:uid'],
        },
    ],
    name: 'UP 主图文',
    maintainers: ['lengthmin', 'Qixingchen', 'hyoban'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/feed/space?host_mid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/article`,
        },
    });
    const data = response.data.data;
    const title = `${name} 的 bilibili 图文`;
    const link = `https://space.bilibili.com/${uid}/article`;
    const description = `${name} 的 bilibili 图文`;
    const cookie = await cache.getCookie();

    const item = await Promise.all(
        data.items.map(async (item) => {
            const link = 'https:' + item.jump_url;
            const data = await cacheGeneral.tryGet(
                link,
                async () =>
                    (
                        await got({
                            method: 'get',
                            url: link,
                            headers: {
                                Referer: `https://space.bilibili.com/${uid}/article`,
                                Cookie: cookie,
                            },
                        })
                    ).data
            );

            const $ = load(data as string);
            const description = $('.opus-module-content').html();
            const pubDate = $('.opus-module-author__pub__text').text().replace('编辑于 ', '');

            const single = {
                title: item.content,
                link,
                description: description || item.content,
                // 2019年11月11日 08:50
                pubDate: pubDate ? parseDate(pubDate, 'YYYY年MM月DD日 HH:mm') : undefined,
            };
            return single;
        })
    );
    return {
        title,
        link,
        description,
        item,
    };
}
