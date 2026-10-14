import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const host = 'http://www.cmse.sdu.edu.cn/';
const typelist = ['通知公告', '学院新闻', '本科生教育', '研究生教育', '学术动态'];
const urlList = ['zxzx/tzgg.htm', 'zxzx/xyxw.htm', 'zxzx/bksjy.htm', 'zxzx/yjsjy.htm', 'zxzx/xsdt.htm'];

export const route: Route = {
    path: '/cmse/:type?',
    categories: ['university'],
    example: '/sdu/cmse/0',
    parameters: { type: '默认为 `0`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '材料科学与工程学院通知',
    maintainers: ['Ji4n1ng'],
    handler,
    description: `| 通知公告 | 学院新闻 | 本科生教育 | 研究生教育 | 学术动态 |
| -------- | -------- | ---------- | ---------- | -------- |
| 0        | 1        | 2          | 3          | 4        |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? Number.parseInt(ctx.req.param('type')) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = load(response.data);

    let item = $('.article_list li')
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            const a = $e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
                pubDate: parseDateInTimezone($e.find('.date').text().replaceAll('/', '-'), 8),
            };
        });

    item = await pMap(
        item.filter((e) => e.link!.startsWith('../info')),
        async (item) => {
            item.link = new URL(item.link!.slice(3), host).href;
            return {
                ...item,
                ...(await cache.tryGet(`cmse:article-v2:${item.link}`, async () => {
                    let response;
                    try {
                        response = await got(item.link);
                    } catch (error) {
                        if (error instanceof FetchError && error.statusCode === 404) {
                            return {};
                        }
                        throw error;
                    }
                    const $ = load(response.data);

                    item.title = $('.contentTitle').text();
                    item.author =
                        $('.contentTitle2')
                            .find('span')
                            .eq(1)
                            .text()
                            .trim()
                            .match(/作者：(.*)/)![1] || '山东大学材料科学与工程学院';
                    $('.contentTitle, .contentTitle2').remove();
                    item.description = $('.content_detail').html();

                    return { title: item.title, author: item.author, description: item.description };
                })),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `山东大学材料科学与工程学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
}
