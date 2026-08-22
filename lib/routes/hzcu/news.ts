import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/latest',
    categories: ['university'],
    example: '/hzcu/news/latest',
    radar: [
        {
            source: ['www.hzcu.edu.cn/xw/xxyw.htm'],
        },
    ],
    name: '学校要闻',
    maintainers: ['zhang-wangz'],
    handler,
    url: 'www.hzcu.edu.cn/xw/xxyw.htm',
};

const baseUrl = 'https://www.hzcu.edu.cn';

async function handler(ctx: Context) {
    const link = `${baseUrl}/xw/xxyw.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('ul.ul-imgtxtq6 li a.con')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const day = $item.find('.pic em').text();
            const yearMonth = $item.find('.pic span').contents().last().text();
            return {
                title: $item.find('.txt h3').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate(`${yearMonth}.${day}`, 'YYYY.MM.DD'), 8),
            };
        })
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                return { ...item, description: $('#vsb_content .v_news_content').html() };
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
