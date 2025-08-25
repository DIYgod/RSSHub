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
    zyxw: { subroute: 'zyxw', title: '主页新闻' },
    zhxw: { subroute: 'zhxw', title: '综合新闻' },
    rcpy: { subroute: 'rcpy', title: '人才培养' },
    xsky: { subroute: 'xsky', title: '学术科研' },
    hzjl: { subroute: 'hzjl', title: '合作交流' },
    yxfc: { subroute: 'yxfc', title: '一线风采' },
    dgrw: { subroute: 'dgrw', title: '大工人物' },
    zxdt: { subroute: 'zyxw', title: '最新动态' }, // 主页新闻页面包含最新动态的前5条内容
};

export const route: Route = {
    path: ['/news/:type'],
    description: `| 板块 | 参数 |
| -------- | -------- |
| 主页新闻 | zyxw |
| 综合新闻 | zhxw |
| 人才培养 | rcpy |
| 学术科研 | xsky |
| 合作交流 | hzjl |
| 一线风采 | yxfc |
| 大工人物 | dgrw |
| 最新动态 | zxdt |`,
    categories: ['university'],
    example: '/dut/news/zyxw',
    parameters: { type: '新闻类别' },
    name: '大连理工大学新闻网',
    url: 'news.dlut.edu.cn',
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

    const urlRoot = 'https://news.dlut.edu.cn';
    const url = `${urlRoot}/${category}.htm`;

    const response = await ofetch(url, { method: 'GET' });
    const $ = load(response);

    let items;
    switch (categoryInfo) {
        case categoryMap.zyxw:
        case categoryMap.zhxw:
        case categoryMap.rcpy:
        case categoryMap.xsky:
        case categoryMap.hzjl:
        case categoryMap.yxfc:
        case categoryMap.dgrw:
            items = $('.aleft li');
            break;
        case categoryMap.zxdt:
            items = $('.aright li');
            break;
        default: // Impossiable, make the github-advanced-security happy.
    }

    items = items
        // .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            // 文章链接
            const link = `${urlRoot}/${item.find('.txt a').attr('href')}`;

            // 文章标题(处理...)
            const title = item.find('.txt a').text();

            // 文章发布时间
            let pubDate;
            pubDate = item.find('.txt time')?.text();
            if (pubDate === undefined || pubDate === '') {
                const unformattedPubDate = item.find('.pic time')?.text();
                if (unformattedPubDate !== undefined) {
                    pubDate = `${unformattedPubDate.slice(2)}-${unformattedPubDate.slice(0, 2)}`;
                }
            }
            pubDate = parseDate(pubDate);

            // 文章简述
            const description = item.find('.txt p').text();

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
