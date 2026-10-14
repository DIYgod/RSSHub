import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['anime'],
    example: '/dorohedoro/news',
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
            source: ['dorohedoro.net/news', 'dorohedoro.net/'],
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    url: 'dorohedoro.net/news',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 25);

    const rootUrl = 'https://dorohedoro.net';
    const apiUrl = `${rootUrl}/news/news.xml`;
    const currentUrl = `${rootUrl}/news/`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = load(response.data, {
        xmlMode: true,
    });

    let items = $('item')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { isNews?: boolean } => {
            const $item = $(item);

            const link = $item.find('permalink').text();
            const isNews = /news_\d+_\d+\.html/.test(link);
            const articleLink = new URL(link, isNews ? currentUrl : rootUrl).href;

            return {
                title: $item.find('title').text(),
                pubDate: timezone(parseDate($item.find('date').text(), 'YYYY.MM.DD'), 9),
                link: articleLink,
                guid: isNews ? articleLink : md5(JSON.stringify([$item.find('title').text(), $item.find('date').text(), link])),
                isNews,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid!, async () => {
                if (item.isNews) {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = load(detailResponse.data);

                        content('#bk_btn').remove();

                        item.title = content('.newsTitle').text();
                        item.description = content('article').html();
                    } catch {
                        // no-empty
                    }
                }

                delete item.isNews;

                return item;
            })
        )
    );

    return {
        title: 'アニメ『ドロヘドロ』',
        link: currentUrl,
        item: items,
    };
}
