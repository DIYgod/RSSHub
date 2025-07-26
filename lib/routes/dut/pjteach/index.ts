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
    xwkd: { subroute: 'index/xwkd', title: '新闻快递' },
    zytz: { subroute: 'index/zytz', title: '重要通知' },
    xkyks: { subroute: 'index/xkyks', title: '选课与考试' },
};

export const route: Route = {
    path: ['/pjteach/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 新闻快递 | xwkd |
| 重要通知 | zytz |
| 选课与考试 | xkyks |`,
    categories: ['university'],
    example: '/dut/pjteach/xwkd',
    parameters: { type: '通知类别' },
    name: '大连理工大学盘锦校区',
    url: 'pjteach.dlut.edu.cn',
    maintainers: ['yaner-here'],
    handler,
};

async function handler(ctx) {
    if (ctx.req.param('type') === undefined) {
        throw new InvalidParameterError('No type specified!');
    }
    const categoryInfo = categoryMap[ctx.req.param('type')];
    const category: string = categoryInfo?.subroute;
    if (category === undefined) {
        throw new InvalidParameterError('Category not found!');
    }

    const urlRoot = 'https://pjteach.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    items = $('.winstyle67894 tr');

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            let link: string;
            switch (categoryInfo) {
                case categoryMap.xwkd: // 绝对路径
                    link = item.find('a').attr('href');
                    break;
                case categoryMap.zytz:
                case categoryMap.xkyks: // 含../的相对路径
                    link = `${urlRoot}/${item.find('a').attr('href').slice(3)}`;
                    break;
                default: // Impossiable, make the github-advanced-security happy.
            }

            // 文章标题(处理...)
            const title = item.find('a').text();

            // 文章发布时间
            const pubDate = parseDate(item.find('.timestyle67894').text()?.slice(0, -1));

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
