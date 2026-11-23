import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/index/:category?',
    categories: ['university'],
    example: '/xaut/index/tzgg',
    parameters: { category: '通知类别，默认为学校新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学校主页',
    maintainers: ['mocusez'],
    handler,
    description: `| 学校新闻 | 砥志研思 | 立德树人 | 传道授业 | 校闻周知 |
| :------: | :------: | :------: | :------: | :------: |
|   xxxw   |   dzys   |   ldsr   |   cdsy   |   xwzz   |`,
};
async function fetchDescription(link: string): Promise<DataItem['description']> {
    if (link.includes('://zhixing.xaut.edu.cn/') || link.includes('://xinwen.xaut.edu.cn/')) {
        return undefined;
    }
    const response = await got(link);
    return load(response.body)('#vsb_content').html();
}
async function handler(ctx) {
    let category = ctx.req.param('category');
    const categoryPaths = { xxxw: 'xxxw.htm', dzys: 'dzys.htm', ldsr: 'ldsr.htm', cdsy: 'cdsy.htm', xwzz: 'xwzz.htm' };
    const categoryTitles = { xxxw: '学校新闻', dzys: '砥志研思', ldsr: '立德树人', cdsy: '传道授业', xwzz: '校闻周知' };
    if (categoryTitles[category] === undefined) {
        category = 'xxxw';
    }
    const response = await got({
        method: 'get',
        url: 'http://www.xaut.edu.cn/index/' + categoryPaths[category],
    });
    const data = response.body;
    const $ = load(data);
    const list = $('div.nlist ul li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const link = new URL($item.find('a').attr('href')!, 'http://www.xaut.edu.cn/index/' + categoryPaths[category]).href;
            const pubDate = parseDateStrict($item.find('div.time').text(), 'YYYY-MM-DD', 8);
            const title = $item.find('h5').text();
            return {
                title,
                link,
                pubDate,
            };
        });
    return {
        title: '西安理工大学官网-' + categoryTitles[category],
        link: 'http://www.xaut.edu.cn',
        description: '西安理工大学官网-' + categoryTitles[category],
        item: await pMap(
            list,
            async (item) => {
                const description = await cache.tryGet(`xaut:index:detail:v3:${item.link}`, () => fetchDescription(item.link!));
                return { ...item, description };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
