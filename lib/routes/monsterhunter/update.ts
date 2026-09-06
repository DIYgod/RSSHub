import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

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
            return {
                title: $item.find('h3').text().trim(),
                link: url2 + $item.attr('href'),
            };
        });

    const result2 = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);
                const title = $('.page-ttl').text().trim();
                $('.page-ttl').remove();

                return {
                    title: title || item.title,
                    description: $('.conts').html(),
                    link: item.link,
                    author: 'MONSTER HUNTER WORLD: ICEBORNE',
                };
            })
        )
    );

    return {
        title: '怪物猎人世界更新情报',
        link: url2,
        item: result2,
    };
}
