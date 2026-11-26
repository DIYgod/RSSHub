import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/cs',
    name: '计算机科学与技术学院通知公告',
    example: '/tongji/cs',
    categories: ['university'],
    maintainers: ['MXH814'],
    url: 'cs.tongji.edu.cn/index/tzgg.htm',
    radar: [{ source: ['cs.tongji.edu.cn/index/tzgg.htm'] }],
    handler,
};

async function handler() {
    const link = 'https://cs.tongji.edu.cn/index/tzgg.htm';
    const html = await ofetch<string>(link);
    const $ = load(html);
    const item = $('.sr_inner1 li a.con[href]')
        .toArray()
        .map((element) => {
            const notice = $(element);
            return {
                title: notice.find('.tit').text(),
                link: new URL(notice.attr('href')!, link).href,
                pubDate: parseDate(notice.find('.date').text(), 'YYYY-MM-DD', 8),
            };
        });

    return { title: '同济大学计算机科学与技术学院通知公告', link, item };
}
