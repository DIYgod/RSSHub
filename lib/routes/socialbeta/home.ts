import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/home',
    categories: ['new-media'],
    example: '/socialbeta/home',
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const currentUrl = 'https://socialbeta.com/';
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.list .tit a')
        .toArray()
        .map((item) => {
            const a = $(item);
            return {
                title: a.text(),
                link: a.attr('href')!,
            };
        });
    const uniqueList = new Map(list.map((item) => [item.link, item])).values().toArray().slice(0, 15);

    const items = await Promise.all(
        uniqueList.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                const date = content('.info_cam, .info_art, .head_zt_right')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                return {
                    ...item,
                    pubDate: date ? timezone(parseDate(date), 8) : undefined,
                    description: content('div.content').html(),
                };
            })
        )
    );

    return {
        title: 'SocialBeta - 首页',
        link: currentUrl,
        item: items,
    };
}
