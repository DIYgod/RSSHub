import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import getCookie from '../utils/pypasswaf';

const host = 'https://cae.nuaa.edu.cn/';

const map = new Map([
    ['zhxw', { title: '综合新闻 | 南京航空航天大学自动化学院', suffix: '5399/list.htm' }],
    ['dwxz', { title: '党委行政 | 南京航空航天大学自动化学院', suffix: '13266/list.htm' }],
    ['rshz', { title: '人事/合作 | 南京航空航天大学自动化学院', suffix: '13267/list.htm' }],
    ['yjs', { title: '研究生培养 | 南京航空航天大学自动化学院', suffix: '13271/list.htm' }],
    ['bks', { title: '本科生培养 | 南京航空航天大学自动化学院', suffix: '13270/list.htm' }],
    ['xsgz', { title: '学生工作 | 南京航空航天大学自动化学院', suffix: '13268/list.htm' }],
    ['tzgg', { title: '通知公告 | 南京航空航天大学自动化学院', suffix: '13264/list.htm' }],
    ['xsxx', { title: '学术信息 | 南京航空航天大学自动化学院', suffix: '13265/list.htm' }],
    ['dbgg', { title: '答辩公告 | 南京航空航天大学自动化学院', suffix: 'dbgg/list.htm' }],
]);

export const route: Route = {
    path: '/cae/:type/:getDescription?',
    name: 'Unknown',
    maintainers: ['Xm798'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const suffix = map.get(type).suffix;
    const getDescription = Boolean(ctx.req.param('getDescription')) || false;
    const link = new URL(suffix, host).href;
    const cookie = await getCookie(host);
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = load(response.data);

    const list = $('#wp_news_w6 ul li')
        .slice(0, 10)
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('a').text(),
                link: $(element).find('a').attr('href'),
                date: $(element).find('span').text(),
            };
            return info;
        });

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;
            let description = title + '<br><a href="' + itemUrl + '" target="_blank">查看原文</a>';

            if (getDescription) {
                description = await cache.tryGet(itemUrl, async () => {
                    const arr = itemUrl.split('.');
                    const pageType = arr.at(-1);
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl, gotConfig);
                        const $ = load(response.data);
                        return $('.wp_articlecontent').html() + '<br><hr /><a href="' + itemUrl + '" target="_blank">查看原文</a>';
                    }
                });
            }

            return {
                title,
                link: itemUrl,
                description,
                pubDate: parseDate(date),
            };
        })
    );

    return {
        title: map.get(type).title,
        link,
        description: '南京航空航天大学自动化学院RSS',
        item: out,
    };
}
