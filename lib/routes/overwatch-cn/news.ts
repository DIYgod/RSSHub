import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/overwatch-cn/news',
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
            source: ['ow.blizzard.cn', 'ow.blizzard.cn/news'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['zhangpeng2k'],
    handler,
};

async function handler() {
    const rootUrl = `https://ow.blizzard.cn/news`;

    const response = await ofetch(rootUrl);
    const $ = load(response);

    const list = $('.list-data-container .list-item-container')
    .toArray()
    .map((item) => {
        item = $(item);
        const title = item.find('.content-title').text();
        const link = item.find('.fill-link').attr('href');
        const description = item.find('.content-intro').text();
        const pubDate = parseDate(item.find('.content-date').text());
        const image = item.find('.item-pic').attr('src');

        return {
            title,
            link,
            description,
            image,
            pubDate,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.detail-content-box').first().html();
                return item;
            })
        )
    );

    return {
        title: `守望先锋官方网站新闻`,
        link: `https://ow.blizzard.cn/news`,
        item: items,
    };
};
