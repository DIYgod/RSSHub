import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/update',
    categories: ['game'],
    example: '/monsterhunter/update',
    radar: [
        {
            source: ['www.monsterhunter.com/', 'www.monsterhunter.com/*path'],
        },
    ],
    name: '更新情报',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const url2 = 'https://www.monsterhunter.com/update/mhw/cn/';
    const response2 = await ofetch(url2);
    const $2 = load(response2);
    const list = $2('.panel-list a')
        .toArray()
        .map((element) => {
            const $item = $2(element);
            const [, year, month, day] = $item
                .find('.date')
                .text()
                .match(/(\d{4})年(\d+)月(\d+)日/)!;
            return {
                pubDate: parseDate(`${year}-${month}-${day}`, 0),
                link: url2 + $item.attr('href'),
            };
        });

    const result2 = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`${item.link}:details`, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);
                const title = $('.page-ttl').text();
                $('.page-ttl').remove();

                return {
                    title,
                    description: $('.conts').html(),
                };
            });
            return { ...details, pubDate: item.pubDate, link: item.link, author: 'MONSTER HUNTER WORLD: ICEBORNE' };
        },
        { concurrency: 3 }
    );

    return {
        title: '怪物猎人世界更新情报',
        link: url2,
        item: result2,
    };
}
