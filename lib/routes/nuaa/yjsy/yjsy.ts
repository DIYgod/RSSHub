import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import getCookie from '../utils/pypasswaf';

const host = 'http://www.graduate.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '通知公告 | 南京航空航天大学研究生院', suffix: '2145/list.htm' }],
    ['xwdt', { title: '新闻动态 | 南京航空航天大学研究生院', suffix: '13276/list.htm' }],
    ['xsxx', { title: '学术信息 | 南京航空航天大学研究生院', suffix: '13277/list.htm' }],
    ['ssfc', { title: '师生风采 | 南京航空航天大学研究生院', suffix: '13278/list.htm' }],
]);

export const route: Route = {
    path: '/yjsy/:type/:getDescription?',
    categories: ['university'],
    example: '/nuaa/yjsy/tzgg/getDescription',
    parameters: { type: '分类名，见下表', getDescription: '是否获取全文' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院',
    maintainers: ['junfengP', 'Seiry', 'Xm798'],
    handler,
    description: `| 通知公告 | 新闻动态 | 学术信息 | 师生风采 |
| -------- | -------- | -------- | -------- |
| tzgg     | xwdt     | xsxx     | ssfc     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const suffix = map.get(type)!.suffix;
    const getDescription = Boolean(ctx.req.param('getDescription'));
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

    const out = await pMap(
        list,
        async (info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            const itemUrl = new URL(info.link!, host).href;
            let description: string | undefined;

            if (getDescription) {
                description = await cache.tryGet(`nuaa:yjsy:article:body:${itemUrl}`, async () => {
                    const arr = itemUrl.split('.');
                    const pageType = arr.at(-1);
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl, gotConfig);
                        const $ = load(response.data);
                        const content = $('.wp_articlecontent');
                        if (!content.length) {
                            throw new Error('Article content was not found at ' + itemUrl);
                        }
                        return content.html() ?? undefined;
                    }
                    return '';
                });
            }

            return {
                title,
                link: itemUrl,
                description,
                pubDate: parseDate(date),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: map.get(type)!.title,
        link,
        description: '南京航空航天大学研究生院RSS',
        item: out,
    };
}
