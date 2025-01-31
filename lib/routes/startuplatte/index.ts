import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media', 'popular'],
    example: '/startuplatte',
    parameters: { category: '分类，见下表，默认为首頁' },
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
            source: ['startuplatte.com/category/:category', 'startuplatte.com/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |
| ---- | -------- | -------- | -------- |
|      | quote    | analysis | trend    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://startuplatte.com';
    const currentUrl = `${rootUrl}${category ? `/category/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.post-header h2 a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.wp-post-navigation').remove();

                item.category = content('.cat').text();
                item.author = content('a[rel="author"]').text();
                item.description = content('.post-entry').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})","dateModified"/)[1]);

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
