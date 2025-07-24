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
    tzgg: { subroute: 'tzgg/tzgg', title: '通知公告' },
    gzdt: { subroute: 'gzdt/gzdt', title: '工作动态' }, // 疑似死链
    zcfg: { subroute: 'zcfg/zcfg', title: '政策法规' },
};

export const route: Route = {
    path: ['/perdep/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 通知公告 | tzgg |
| 工作动态 | gzdt |
| 政策法规 | zcfg |`,
    categories: ['university'],
    example: '/dut/perdep/tzgg',
    parameters: { type: '信息类别' },
    name: '大连理工大学人力资源处',
    url: 'perdep.dlut.edu.cn',
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

    const urlRoot = 'https://perdep.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.ny_right .con li');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('a').attr('href')}`;

            // 文章标题(处理...)
            const title = item.find('a > strong').text();

            // 文章发布时间
            const pubDate = parseDate(item.find('span')?.text());

            // 文章简述
            const description = item.find('p')?.text();

            const result = {
                link,
                title,
                pubDate,
                description,
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
