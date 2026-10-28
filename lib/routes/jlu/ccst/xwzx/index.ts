import { load } from 'cheerio'; // HTML parser with jQuery-like API

import type { Route } from '@/types';
import got from '@/utils/got'; // Custom got instance
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ccst/xwzx/:category',
    categories: ['university'],
    example: '/jlu/ccst/xwzx/gsl',
    parameters: { category: '栏目，可用 gsl（公示栏）、xstd（学生天地）、xytz（学院通知）、xyxw（学院新闻）、zsjy（招生就业）等对应列表文件名，不含 .htm。' },
    radar: [
        {
            source: ['ccst.jlu.edu.cn/xwzx/gsl.htm'],
            target: '/ccst/xwzx/gsl',
        },
        {
            source: ['ccst.jlu.edu.cn/xwzx/xstd.htm'],
            target: '/ccst/xwzx/xstd',
        },
        {
            source: ['ccst.jlu.edu.cn/xwzx/xytz.htm'],
            target: '/ccst/xwzx/xytz',
        },
        {
            source: ['ccst.jlu.edu.cn/xwzx/xyxw.htm'],
            target: '/ccst/xwzx/xyxw',
        },
        {
            source: ['ccst.jlu.edu.cn/xwzx/zsjy.htm'],
            target: '/ccst/xwzx/zsjy',
        },
    ],
    name: '计算机科学与技术学院 - 新闻中心',
    maintainers: ['mayouxi'],
    handler,
    url: 'ccst.jlu.edu.cn',
};

async function handler(ctx: any) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://ccst.jlu.edu.cn';
    const url = `${baseUrl}/xwzx/${category}.htm`;
    const response = await got(url);
    const $ = load(response.body);

    const list = $('.section.container .main .list3 ul li');

    const titles = {
        gsl: '公示栏',
        xstd: '学生天地',
        xytz: '学院通知',
        xyxw: '学院新闻',
        zsjy: '招生就业',
    };

    const titleSuffix = titles[category] || '新闻中心'; // Fallback to '新闻中心' if category is not found

    return {
        title: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,
        link: baseUrl,
        description: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,

        item: list.toArray().map((item) => {
            const el = $(item);

            const linkEl = el.find('a');
            const dateEl = el.find('.date');
            const dateStr = dateEl.text();
            const title = linkEl.text();
            const link = new URL(linkEl.attr('href')!, url).href;

            const date = dateStr.match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];

            return {
                title,
                link,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
        }),
    };
}
