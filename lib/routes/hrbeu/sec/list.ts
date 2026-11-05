import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://sec.hrbeu.edu.cn';

export const route: Route = {
    path: '/sec/:id',
    categories: ['university'],
    example: '/hrbeu/sec/xshd',
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
            source: ['sec.hrbeu.edu.cn/:id/list.htm'],
        },
    ],
    name: '船舶工程学院',
    maintainers: ['Chi-hong22'],
    handler,
    description: `| 学院要闻 | 学术活动 | 通知公告 | 学科方向 |
| :------: | :------: | :------: | :------: |
|   xyyw   |   xshd   |    229   |   xkfx   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const response = await got(`${rootUrl}/${id}/list.htm`);

    const $ = load(response.data);

    const bigTitle = $('div [class=lanmuInnerMiddleBigClass_right]').find('div [portletmode=simpleColumnAttri]').text().replaceAll(/[\s·]/g, '');

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
        title: '船舶工程学院 - ' + bigTitle,
        link: rootUrl.concat('/', id, '/list.htm'),
        item: items,
    };
}
