import { Route } from '@/types';
import { namespace } from './namespace';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import dayjs from 'dayjs';

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/chongdiantou',
    radar: [
        {
            source: ['www.chongdiantou.com'],
        },
    ],
    name: '最新资讯',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.chongdiantou.com',
};

async function handler() {
    const response = await ofetch('https://www.chongdiantou.com');
    const $ = load(response);
    let items = [];

    $('.list-item').each((index, element) => {
        const $item = $(element);
        const item = {};
        item.link = $item.find('.list-title a').attr('href') || item.link;
        item.title = $item.find('.list-title a').text().trim() || item.title;
        item.image = $item.find('.media-content img').attr('src') || item.image;
        items.push(item);
    });

    items = await Promise.all(
        items.map(async (item) => await cache.tryGet(item.link, async () => {
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('.post-content').html() || 'No content found';
                    // Parse date
                    const pubText = $('.text-xs.text-muted').text().trim();
                    const parsedDate = dayjs(pubText, 'MM月 DD, YYYY');
                    item.pubDate = parsedDate.isValid() ? parsedDate.toDate() : new Date();
                } catch {
                    item.description = 'Failed to fetch content';
                }
                return item;
            }))
    );

    return {
        title: '充电头网 - 最新资讯',
        description: '充电头网新闻资讯',
        link: 'https://www.chongdiantou.com',
        image: 'https://static.chongdiantou.com/wp-content/uploads/2021/02/2021021806172389.png',
        item: items,
    };
}
