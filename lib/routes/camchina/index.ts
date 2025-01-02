import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:id?',
    categories: ['study'],
    example: '/camchina',
    parameters: { id: '分类，见下表，默认为 1，即新闻' },
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
            source: ['cste.org.cn/categories/:id', 'cste.org.cn/'],
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 新闻 | 通告栏 |
  | ---- | ------ |
  | 1    | 2      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'http://www.camchina.org.cn';
    const currentUrl = `${rootUrl}/categories/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.M-main-l p a')
        .slice(0, limit)
        .toArray()
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

                item.description = content('.content').html();

                return item;
            })
        )
    );

    return {
        title: `中国管理现代化研究会 - ${$('.title_red').text()}`,
        link: currentUrl,
        item: items,
    };
}
