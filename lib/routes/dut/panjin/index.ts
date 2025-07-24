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
    xqxw: { subroute: 'xqxw1', title: '校区新闻' },
    tzgg: { subroute: 'tzgg', title: '通知公告' },
    zhxw: { subroute: 'sy/zhxw1', title: '综合新闻' },
    rcpy: { subroute: 'sy/rcpy', title: '人才培养' },
    xsky: { subroute: 'sy/xsky', title: '学术科研' },
    hzjl: { subroute: 'sy/hzjl', title: '合作交流' },
    xywh: { subroute: 'sy/xywh', title: '校园文化' },
    xyfc: { subroute: 'sy/xyfc', title: '学院风采' },
    zxdt: { subroute: 'zxdt', title: '最新动态' },
};

export const route: Route = {
    path: ['/panjin/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 校区新闻 | xqxw |
| 通知公告 | tzgg |
| 综合新闻 | zhxw |
| 人才培养 | rcpy |
| 学术科研 | xsky |
| 合作交流 | hzjl |
| 校园文化 | xywh |
| 最新动态 | zxdt |`,
    categories: ['university'],
    example: '/dut/panjin/xqxw',
    parameters: { type: '通知类别' },
    name: '大连理工大学盘锦校区',
    url: 'panjin.dlut.edu.cn',
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

    const urlRoot = 'https://panjin.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.tzgg li');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('a').attr('href').slice(3)}`;

            // 文章标题(处理...)
            const title = item.find('.elise').text();

            // 文章发布时间
            const pubDate = parseDate(item.find('span').text()?.slice(1, -1));

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
