import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/kjc',
    categories: ['university'],
    example: '/bjfu/kjc',
    parameters: {},
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
            source: ['kyc.bjfu.edu.cn/'],
        },
    ],
    name: '科技处通知公告',
    maintainers: ['markmingjie'],
    handler,
    url: 'kyc.bjfu.edu.cn/',
};

async function handler(ctx) {
    const limit = Math.min(getRouteLimit(ctx, 15), 15);
    const url = 'https://kyc.bjfu.edu.cn/tztg/index.htm';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.ll_con_r_b li')
        .slice(0, limit)
        .toArray()
        .map((e): DataItem => {
            const element = $(e);
            const title = element.find('.ll_con_r_b_title a').text();
            const link = element.find('a').attr('href');
            const date = element
                .find('.ll_con_r_b_time')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date?.[0] ?? ''), 8);

            return {
                title,
                link: new URL(link!, url).href,
                author: '北京林业大学科技处通知公告',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('#a_con_l_con').html();
                item.title = item.title.includes('...') ? itemElement('#a_con_l_title').text() : item.title;

                return item;
            })
        )
    );

    return {
        title: '北林科技处通知',
        link: url,
        item: result,
    };
}
