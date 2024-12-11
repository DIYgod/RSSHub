import { Route } from '@/types';
import { namespace } from './namespace';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import logger from '@/utils/logger';

function getFullText(list: any[]) {
    return Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await ofetch(item.link, {
                        headers: {
                            referrer: 'https://www.chongdiantou.com/',
                            method: 'GET',
                        },
                    });
                    const $ = load(response);
                    item.description = $('.post-content').html();
                    const authorText = $('.post-meta a').text().trim();
                    item.author = authorText.split(/\s+/)[0] || '充电头网';
                    return item;
                } catch (error) {
                    logger.error(`Error fetching full text for ${item.link}:`, error);
                    return item;
                }
            })
        )
    );
}

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/chongdiantou',
    radar: [
        {
            source: ['www.chongdiantou.com'],
        },
    ],
    name: '充电头网',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.chongdiantou.com',
};

async function handler() {
    const url = 'https://www.chongdiantou.com/';
    const response = await ofetch(url, {
        headers: {
            referrer: 'https://www.chongdiantou.com/',
            method: 'GET',
        },
    });
    const $ = load(response);
    const list = [];
    $('.list-item.block').each((index, element) => {
        const item = $(element);
        // logger.info(item);
        const titleElement = item.find('.list-title a');
        const link = titleElement.attr('href');
        const title = titleElement.text().trim();
        const categoryElement = item.find('.item-badge');
        const category = categoryElement.text().trim();
        const timeElement = item.find('time');
        const pubDateStr = timeElement.text().trim(); // 12月 11，2024 -> 12/11/2024
        const pubDate = new Date(pubDateStr.replaceAll(/月|，/g, '/'));
        const imageElement = item.find('img.lazy');
        const imageSrc = imageElement.attr('data-src') || imageElement.attr('src');
        if (!title) {
            return;
        }
        list.push({
            title,
            link,
            pubDate,
            category,
            image: imageSrc,
        });
    });
    const items = await getFullText(list);

    return {
        title: '充电头网 - 最新资讯',
        description: '充电头网新闻资讯',
        link: 'https://www.chongdiantou.com/',
        image: 'https://static.chongdiantou.com/wp-content/uploads/2021/02/2021021806172389.png',
        item: items,
    };
}
