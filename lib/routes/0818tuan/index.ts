import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:listId?',
    categories: ['shopping'],
    example: '/0818tuan',
    parameters: { listId: '活动分类，见下表，默认为 `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['TonyRL'],
    handler,
    description: `| 最新线报 | 实测活动 | 优惠券 |
| -------- | -------- | ------ |
| 1        | 2        | 3      |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.0818tuan.com';
    const listId = ctx.req.param('listId') || '1';
    const url = `${baseUrl}/list-${listId}-0.html`;

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $(listId === '3' ? '.col-xs-12 .thumbnail > a' : '.col-md-8 .list-group > a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: item.attr('href').startsWith('http') ? item.attr('href') : `${baseUrl}${item.attr('href')}`,
            };
        })
        .filter((i) => !i.link.includes('m.0818tuan.com/tb1111.php'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.pageLink, .alert, p[style="margin:15px;"]').remove();

                item.description = $('.post-content').html();
                item.pubDate = timezone(parseDate($('.panel-body > .text-center').text().replace('时间:', ''), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        image: 'http://www.0818tuan.com/favicon.ico',
        item: items,
    };
}
