import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { rootUrl, renderPostDetail } from './util';

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    example: '/taoguba',
    parameters: { id: '分类，见下表，默认为社区总版' },
    name: '淘股论坛',
    maintainers: ['nczitzk'],
    handler,
    description: `| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
| -------- | -------- | -------- | -------- |
| bbs      | zongban  | jinghua  | dianzan  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'zongban';

    const currentUrl = `${rootUrl}/${category}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.Nbbs-tiezi-lists')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 70)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.middle-list-tittle a');

            return {
                title: a.text().trim(),
                link: `${rootUrl}/${a.attr('href')}`,
                author: item.find('.middle-list-user a').text().trim(),
            };
        });

    items = await Promise.all(items.map(async (item) => await renderPostDetail(item)));

    return {
        title: $('head title').text().trim().split('_')[0],
        link: currentUrl,
        item: items,
    };
}
