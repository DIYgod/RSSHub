import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['study'],
    example: '/cste',
    parameters: { id: '分类，见下表，默认为 16，即通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 通知公告 | 学会新闻 | 科协简讯 | 学科动态 | 往事钩沉 |
| -------- | -------- | -------- | -------- | -------- |
| 16       | 18       | 19       | 20       | 21       |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '16';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const rootUrl = 'https://www.cste.org.cn';
    const currentUrl = `${rootUrl}/site/term/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a.list-group-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h5').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('small').text()),
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

                content('.Next').remove();

                item.description = content('.article').html();

                return item;
            })
        )
    );

    return {
        title: `中国技术经济学会 - ${$('.leftTop').text()}`,
        link: currentUrl,
        item: items,
    };
}
