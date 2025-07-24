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
    gzdt: { subroute: 'gzdt1', title: '工作动态' },
    zcfg: { subroute: 'dsdw/zcfg', title: '政策法规' },
    zytz: { subroute: 'zytz', title: '重要通知' },
};

export const route: Route = {
    path: ['/gs/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 工作动态 | gzdt |
| 政策法规 | zcfg |
| 重要通知 | zytz |`,
    categories: ['university'],
    example: '/dut/gs/gzdt',
    parameters: { type: '通知类别' },
    name: '大连理工大学研究生院',
    url: 'gs.dlut.edu.cn',
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

    const urlRoot = 'https://gs.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.ny_right .list li');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('a').attr('href')}`;

            // 文章标题(处理...)
            const title = item.find('a').text();

            // 文章发布时间
            const pubDate = parseDate(item.find('.date').text()?.slice(1, -1));

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
