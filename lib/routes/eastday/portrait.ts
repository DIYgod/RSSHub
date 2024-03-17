import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/portrait',
    categories: ['traditional-media'],
    example: '/eastday/portrait',
    parameters: {},
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
            source: ['www.eastday.com/'],
        },
    ],
    name: '原创',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.eastday.com/',
};

async function handler() {
    const rootUrl = 'https://apin.eastday.com';
    const currentUrl = `${rootUrl}/api/news/Portrait`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            currentPage: 1,
            pageSize: 30,
        },
    });

    const list = response.data.list.map((item) => ({
        link: item.url,
        title: item.title,
        pubDate: timezone(parseDate(item.time), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.detail').html();

                return item;
            })
        )
    );

    return {
        title: '原创 - 东方网',
        link: 'https://www.eastday.com/eastday/shouye/07index/yc/index.html',
        item: items,
    };
}
