import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const finalLimit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const baseUrl = 'http://due.hitsz.edu.cn';

    // 所有需要抓取的栏目
    const categories = [
        'jwxw/jwgl', // 教务管理
        'jwxw/kwgl', // 考务管理
        'jwxw/zcgl', // 注册管理
        'jwxw/xkgl', // 选课管理
        'jwxw/cjgl', // 成绩管理
        'jwxw/xjgl_b_', // 学籍管理（本）
        'jwxw/xjgl_y_', // 学籍管理（研）
        'jwxw/jxxxh', // 教学信息化
        'jwxw/jzxj', // 奖助学金
        'xwgl/bksxw', // 本科生新闻
        'xwgl/ssxwpy/ktyzj', // 硕士学位培养
        'xwgl/bsxwpy/qqhj1', // 博士学位培养
    ];

    // 并发抓取所有栏目的第一页
    const pagePromises = categories.map((category) => {
        const pageUrl = new URL(`${category}.htm`, baseUrl).href;
        return got(pageUrl).catch(() => null);
    });

    const pageResponses = await Promise.all(pagePromises);

    // 提取所有文章链接
    const articlePromises = [];
    for (const [i, response] of pageResponses.entries()) {
        if (!response) {
            continue;
        }

        const category = categories[i];
        const $ = load(response.data);
        const listItemsOnPage = $('ul.box-main-list li, .list-main li, .list-main-modular li').toArray();

        for (const el of listItemsOnPage) {
            const $el = $(el);
            const linkUrl = $el.find('a').attr('href');
            if (!linkUrl) {
                continue;
            }

            const title = $el.find('span.text-over, a').text().trim();
            const pubDateStr = $el.find('label').text().trim();

            const item = {
                title,
                link: new URL(linkUrl, baseUrl).href,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : null,
                category,
                description: title, // 使用标题作为描述
            };

            articlePromises.push(Promise.resolve(item));
        }
    }

    // 获取所有文章详情
    const allResolvedItems = (await Promise.all(articlePromises)).filter(Boolean);

    // 排序和截取
    const filteredItems = allResolvedItems
        .filter((item) => !item.title.includes('统一身份认证平台'))
        .toSorted((a, b) => (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0))
        .slice(0, finalLimit);

    return {
        title: '哈尔滨工业大学（深圳）教务部-教务学务与学位管理-所有栏目新闻汇总',
        description: '哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总，包括教务管理、考务管理、注册管理、选课管理、成绩管理、学籍管理、教学信息化、奖助学金、本科生新闻、硕士学位培养、博士学位培养等',
        link: 'http://due.hitsz.edu.cn/jwxw/jwgl.htm',
        item: filteredItems,
        author: '哈尔滨工业大学（深圳）教务部',
    };
};

export const route: Route = {
    path: '/due/general',
    name: '教务部教务学务与学位管理所有栏目',
    url: 'due.hitsz.edu.cn',
    maintainers: ['guohuiyuan'],
    handler,
    example: '/hitsz/due/general',
    description: `哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总，包括：
- [教务管理](http://due.hitsz.edu.cn/jwxw/jwgl.htm)
- [考务管理](http://due.hitsz.edu.cn/jwxw/kwgl.htm)
- [注册管理](http://due.hitsz.edu.cn/jwxw/zcgl.htm)
- [选课管理](http://due.hitsz.edu.cn/jwxw/xkgl.htm)
- [成绩管理](http://due.hitsz.edu.cn/jwxw/cjgl.htm)
- [学籍管理（本）](http://due.hitsz.edu.cn/jwxw/xjgl_b_.htm)
- [学籍管理（研）](http://due.hitsz.edu.cn/jwxw/xjgl_y_.htm)
- [教学信息化](http://due.hitsz.edu.cn/jwxw/jxxxh.htm)
- [奖助学金](http://due.hitsz.edu.cn/jwxw/jzxj.htm)
- [本科生新闻](http://due.hitsz.edu.cn/xwgl/bksxw.htm)
- [硕士学位培养](http://due.hitsz.edu.cn/xwgl/ssxwpy/ktyzj.htm)
- [博士学位培养](http://due.hitsz.edu.cn/xwgl/bsxwpy/qqhj1.htm)`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['due.hitsz.edu.cn/jwxw/jwgl.htm'],
            target: '/hitsz/due/general',
        },
    ],
};
