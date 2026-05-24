import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/csw/:category',
    categories: ['university'],
    example: '/jlu/csw/jbtz',
    radar: [
        {
            source: ['csw.jlu.edu.cn/index/jbtz.htm', 'csw.jlu.edu.cn/index/xbtz.htm'],
        },
    ],
    name: '吉林大学软件学院 - 通知公告',
    maintainers: ['Rito-492'],
    handler,
    url: 'csw.jlu.edu.cn',
};

async function handler(ctx: any) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://csw.jlu.edu.cn';
    const url = `${baseUrl}/index/${category}.htm`;
    const response = await got(url);
    const $ = load(response.body);

    const list = $('.text-list ul li');

    const titles: { [key: string]: string } = {
        jbtz: '教办通知',
        xbtz: '学办通知',
    };

    const titleSuffix = titles[category] || '通知公告';

    return {
        title: `吉林大学软件学院 - ${titleSuffix}`,
        link: baseUrl,
        description: `吉林大学软件学院 - ${titleSuffix}`,

        item: list.toArray().map((item) => {
            const el = $(item);
            const linkEl = el.find('.title a');
            const dateStr = el.find('.time').text().trim();
            const title = linkEl.text().trim();
            const rawLink = linkEl.attr('href')!.replaceAll('..', '');
            const link = `${baseUrl}${encodeURI(rawLink)}`;

            return {
                title,
                link,
                pubDate: new Date(dateStr),
            };
        }),
    };
}
