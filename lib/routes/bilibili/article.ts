import { type CheerioAPI, load } from 'cheerio';

import type { Route } from '@/types';
import cacheGeneral from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import cache from './cache';

const getOpusPubDate = ($: CheerioAPI) => {
    const prefix = 'window.__INITIAL_STATE__=';
    const stateScript = $('script')
        .toArray()
        .map((script) => $(script).text())
        .find((script) => script.startsWith(prefix));
    const stateEnd = stateScript?.lastIndexOf(';(function');
    if (stateScript && stateEnd !== undefined && stateEnd > prefix.length) {
        const state = JSON.parse(stateScript.slice(prefix.length, stateEnd));
        const timestamp = state.detail?.modules?.find((module) => module.module_author)?.module_author?.pub_ts;
        if (timestamp) {
            return parseDate(timestamp, 'X');
        }
    }
    const displayTime = $('.opus-module-author__pub__text').text().replace('编辑于 ', '');
    return displayTime ? timezone(parseDate(displayTime, 'YYYY年MM月DD日 HH:mm'), 8) : undefined;
};

export const route: Route = {
    path: '/user/article/:uid',
    categories: ['social-media'],
    example: '/bilibili/user/article/334958638',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到' },
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
    const entries = data.items;

    const item = await Promise.all(
        entries.map(async (item) => {
            const link = 'https:' + item.jump_url;
            const data = await cacheGeneral.tryGet<string>(
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

            const $ = load(data);
            const description = $('.opus-module-content').html();

            const single = {
                title: item.content,
                link,
                description: description || item.content,
                pubDate: getOpusPubDate($),
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
