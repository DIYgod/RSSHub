import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/sakurazaka46/news',
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
            source: ['sakurazaka46.com/s/s46/news/list', 'sakurazaka46.com/'],
        },
    ],
    name: 'Sakurazaka46 News 櫻坂 46 新闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'sakurazaka46.com/s/s46/news/list',
};

async function handler(ctx) {
    const rootUrl = 'https://sakurazaka46.com';
    const currentUrl = `${rootUrl}/s/s46/news/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.com-news-part .box a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.lead').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
                pubDate: parseDate(item.find('.date').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.article').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
