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
    xwdt: { subroute: 'xwdt/xwdt', title: '新闻动态' },
    jdxw: { subroute: 'xwdt/jdxw', title: '焦点新闻' },
    xytz: { subroute: 'xytz/xytz', title: '学院通知' },
    bkstz: { subroute: 'rcpy/bkspy/bkstz', title: '本科生通知' },
    yjstz: { subroute: 'rcpy/yjspy/yjstz', title: '研究生通知' },
};

export const route: Route = {
    path: ['/ss/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 新闻动态 | xwdt |
| 焦点新闻 | jdxw |
| 学院通知 | xytz |
| 本科生通知 | bkstz |
| 研究生通知 | yjstz |`,
    categories: ['university'],
    example: '/dut/ss/xwdt',
    parameters: { type: '通知类别' },
    name: '大连理工大学软件学院',
    url: 'ss.dlut.edu.cn',
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

    const urlRoot = 'https://ss.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.ny_right .item');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('a').attr('href').slice(6)}`;

            // 文章标题(处理...)
            const title = item.find('.txt > h2').text();

            // 文章发布时间
            const unformattedPubDate = item.find('.date').text();
            const pubDate = parseDate(`${unformattedPubDate.slice(0, 7)}-${unformattedPubDate.slice(7)}`);

            // 文章简述
            const description = item.find('.txt > p').text();

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
