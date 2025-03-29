import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

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
    const url = `${rootUrl}/v1/index/newsList`;
    const { data } = await ofetch(url, {
        headers: {
            'game-alias': 'www',
            'device-num': '1',
            'User-Agent': config.ua,
        },
        query: {
            page_no: 1,
            limit: 20,
        },
    });
    const list = data.map((item) => {
        const link = new URL(`${item.id}.html`, rootUrl).href;
        const title = item.title;
        const pubDate = parseDate(item.created_at, 'X');
        return {
            link,
            title,
            pubDate,
        };
    });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('div.content').html();
                return item;
            })
        )
    );

    return {
        link: `${rootUrl}/news`,
        title: '游戏情报|Gamekee',
        item: items,
    };
}
