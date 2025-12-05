import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'http://t.imop.com';

export const route: Route = {
    path: '/tianshu',
    categories: ['game'],
    example: '/imop/tianshu',
    radar: [
        {
            source: ['t.imop.com'],
            target: '/tianshu',
        },
    ],
    name: '全部消息',
    maintainers: ['zhkgo'],
    handler,
};

async function handler() {
    const { data: response } = await got(`${baseUrl}/list/0-1.htm`, { responseType: 'buffer' });
    const $ = load(iconv.decode(response, 'gbk'));
    const list = $('.right .right_top .right_bot .list2 .ul1 ul')
        .toArray()
        .map((item) => {
            item = $(item);
            const href: string = item.find('a').attr('href');
            return {
                title: item.find('a').text(),
                link: href.startsWith('http') ? href : `${baseUrl}${href}`,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, { responseType: 'buffer' });
                const $ = load(iconv.decode(response, 'gbk'));
                item.description = $('.right .right_top .right_bot .articlebox').html();
                return item;
            })
        )
    );

    return {
        title: '天书最新消息',
        link: `${baseUrl}/list/0-1.htm`,
        item: items,
    };
}
