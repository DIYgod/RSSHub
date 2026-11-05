import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.jseea.cn';
const siteTitle = ' - 江苏省教育考试院';

async function loadContent(link) {
    const { data: response } = await got(link);

    const $ = load(response);

    const description = $('#content').html();

    return description;
}

export const route: Route = {
    path: '/news/:type?',
    categories: ['government'],
    example: '/jseea/news/zkyw',
    parameters: { type: '分类，默认为 `zkyw`，具体参数见下表' },
    radar: [
        {
            source: ['jseea.cn/webfile/news/:type'],
            target: '/news/:type',
        },
    ],
    name: '新闻中心',
    maintainers: ['schen1024'],
    handler,
    description: `| 招考要闻 | 教育动态 | 招考信息 | 政策文件 | 院校动态 |
| :------: | :------: | :------: | :------: | :------: |
|   zkyw   |   jydt   |   zkxx   |   zcwj   |   yxdt   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'zkyw';
    const listPageUrl = `${baseUrl}/webfile/news/${type}/`;
    const { data: response } = await got(listPageUrl);
    const $ = load(response);

    const list = $('div.content-list-div ul li a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item
                    .contents()
                    .filter((_, e) => e.nodeType === 3)
                    .text(),
                link: new URL($item.attr('href')!, listPageUrl).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const result = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`jseea:article:${item.link}`, () => loadContent(item.link)),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text() + siteTitle,
        link: listPageUrl,
        item: result,
    };
}
