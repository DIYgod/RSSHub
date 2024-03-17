import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/hinatazaka46/news',
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
            source: ['hinatazaka46.com/s/official/news/list', 'hinatazaka46.com/'],
        },
    ],
    name: 'Hinatazaka46 News 日向坂 46 新闻',
    maintainers: ['crispgm', 'akashigakki'],
    handler,
    url: 'hinatazaka46.com/s/official/news/list',
};

async function handler(ctx) {
    const rootUrl = 'https://www.hinatazaka46.com';
    const currentUrl = `${rootUrl}/s/official/news/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.p-news__list .p-news__item a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.c-news__text').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
                pubDate: parseDate(item.find('.c-news__date').text()),
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

                item.description = content('.p-article__text').html();

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
