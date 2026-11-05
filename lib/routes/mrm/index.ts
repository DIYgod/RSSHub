import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    example: '/mrm',
    parameters: { category: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知',
    maintainers: ['TonyRL'],
    handler,
    description: `| 交易通知     | 政策规定             | 业务通知          |
| ------------ | -------------------- | ----------------- |
| zonghezixun3 | zhengceguiding\\_list | yewutongzhi\\_list |`,
};

async function handler(ctx) {
    const { category = 'zonghezixun3' } = ctx.req.param();
    const baseUrl = 'http://www.mrm.com.cn';
    const link = `${baseUrl}/${category}.html`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('#datalist_wap .li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('.d').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link!, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                const description = $('.article-cont').html();
                return { description };
            });
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
