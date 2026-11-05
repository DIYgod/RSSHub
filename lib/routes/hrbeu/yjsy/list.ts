import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://yjsy.hrbeu.edu.cn';

export const route: Route = {
    path: '/yjsy/list/:id',
    categories: ['university'],
    example: '/hrbeu/yjsy/list/2981',
    parameters: { id: '栏目编号，由 `URL` 中获取。' },
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
            source: ['yjsy.hrbeu.edu.cn/:id/list.htm'],
        },
    ],
    name: '研究生院',
    maintainers: ['Derekmini'],
    handler,
    description: `| 通知公告 | 新闻动态 | 学籍注册 | 奖助学金 | 其他 |
| :------: | :------: | :------: | :------: | :--: |
|   2981   |   2980   |   3009   |   3011   |  ... |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got(`${rootUrl}/${id}/list.htm`);

    const $ = load(response.data);

    const bigTitle = $('div [id=lanmuInnerMiddleBigClass_right]')
        .find('div [portletmode=simpleColumnAttri]')
        .text()
        .replaceAll(/[\t\n\r ·]/g, '')
        .trim();

    const list = $('li.list_item')
        .toArray()
        .map((item): DataItem => {
            const link = new URL($(item).find('a').attr('href')!, `${rootUrl}/${id}/list.htm`).href;
            return {
                title: $(item).find('a').attr('title')!,
                pubDate: $(item).find('span.Article_PublishDate').text() ? timezone(parseDate($(item).find('span.Article_PublishDate').text()), 8) : undefined,
                link,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                if (item.link!.includes('page.htm')) {
                    const detailResponse = await got(item.link);
                    const content = load(detailResponse.data);
                    item.description = content('div.wp_articlecontent').html();
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '研究生院-' + bigTitle,
        link: rootUrl.concat('/', id, '/list.htm'),
        item: items,
    };
}
