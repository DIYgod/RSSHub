import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/list/:category?',
    categories: ['new-media'],
    example: '/dedao/list/年度日更',
    parameters: { category: '分类名，默认为年度日更' },
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
            source: ['igetget.com/'],
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'igetget.com/',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '年度日更';

    const rootUrl = 'https://www.igetget.com';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const listUrl = `${rootUrl}${response.data.match(/<a href="(.*)">年度日更<\/a>/)[1]}`;

    const listResponse = await got({
        method: 'get',
        url: listUrl,
    });

    const currentUrl = `${rootUrl}${listResponse.data.match(new RegExp('<span>' + category + String.raw`<\/span><a href="(.*)" rel="tag"><\/a>`))[1].split('"')[0]}`;

    const currentResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(currentResponse.data);

    let items = $('.pro-info p a')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                content('.more-bt').remove();

                item.description = content('.main-content-wrapper').html();

                return item;
            })
        )
    );

    return {
        title: `得到 - ${category}`,
        link: currentUrl,
        item: items,
    };
}
