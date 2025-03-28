import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/gamekee/news',
    radar: [
        {
            source: ['gamekee.com', 'gamekee.com/news'],
            target: '/news',
        },
    ],
    name: '游戏情报',
    maintainers: ['ueiu'],
    handler,
    url: 'gamekee.com/news',
};

async function handler() {
    const rootUrl = 'https://www.gamekee.com';
    const url = `${rootUrl}/news`;
    const response = await ofetch(url);
    const $ = load(response);
    const list = $('.list-box .item')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = new URL(item.attr('href'), rootUrl).href;
            const title = item.find('.item-r .title').text();
            return {
                link,
                title,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.pubDate = timezone(parseDate($('time').attr('datetime')), +8);
                item.description = $('div.content').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        item: items,
        link: url,
    };
}
