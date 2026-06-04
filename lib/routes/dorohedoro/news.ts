import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

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
        .map((item) => {
            item = $(item);

            const link = item.find('permalink').text();
            const isNews = /news_\d+_\d+\.html/.test(link);

            return {
                title: item.find('title').text(),
                pubDate: parseDate(item.find('date').text()),
                link: `${rootUrl}${isNews ? `/news/${link}` : ''}`,
                isNews,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
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
