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
    xwkd: { subroute: 'xwkd/xwkd.htm', title: '新闻快递' },
    zytg: { subroute: 'zhongyaotonggao/list.jsp?totalpage=81&PAGENUM=1&urltype=tree.TreeTempUrl&wbtreeid=1016', title: '重要通告' },
};

export const route: Route = {
    path: ['/teach/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 新闻快递 | xwkd |
| 重要通告 | zytg |`,
    categories: ['university'],
    example: '/dut/teach/zytg',
    parameters: { type: '通知类别' },
    name: '大连理工大学教务处',
    url: 'teach.dlut.edu.cn',
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

    const urlRoot = 'https://teach.dlut.edu.cn';
    const url = `${urlRoot}/${category}`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.list li');

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
            const pubDate = parseDate(item.find('span')?.text());

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
