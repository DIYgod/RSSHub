import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { parseDate } from '@/utils/parse-date';

interface CategoryInfo {
    subroute: string;
    title: string;
}
const categoryMap: { [key: string]: CategoryInfo } = {
    tzgg: { subroute: 'n/tzgg', title: '通知公告' },
};

export const route: Route = {
    path: ['/eda/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 通知公告 | tzgg |`,
    categories: ['university'],
    example: '/dut/eda/tzgg',
    parameters: { type: '通知类别' },
    name: '大连理工大学开发区校区管委会',
    url: 'eda.dlut.edu.cn',
    maintainers: ['yaner-here'],
    handler,
};

async function handler(ctx) {
    if (ctx.req.param('type') === undefined) {
        throw new InvalidParameterError('No type specified!');
    }
    const categoryInfo = categoryMap[ctx.req.param('type')];
    const category: string = categoryInfo.subroute;
    if (category === undefined) {
        throw new InvalidParameterError('Category not found!');
    }

    const urlRoot = 'https://eda.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.main .list li');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('a').attr('href').slice(3)}`;

            // 文章标题(处理...)
            const title = item.find('a').text();

            // 文章发布时间
            const pubDate = parseDate(item.find('span').text().slice(1, -1));

            const result = {
                link,
                title,
                pubDate,
            };
            return result;
        });

    return {
        title: `${route.name} - ${categoryInfo.title}`,
        link: url,
        item: items,
        allowEmpty: true,
    };
}
