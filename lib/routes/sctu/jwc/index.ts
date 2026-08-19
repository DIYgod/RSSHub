import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/sctu/jwc/tzgg',
    parameters: {
        category: {
            description: '分类',
            options: [
                { value: 'tzgg', label: '通知公告' },
                { value: 'xwdt', label: '新闻动态' },
            ],
            default: 'tzgg',
        },
    },
    radar: [
        {
            source: ['www.sctu.edu.cn/jwc/wenzhangg/:category.htm'],
            target: '/jwc/:category',
        },
    ],
    name: '教务处',
    maintainers: ['talenHuang'],
    handler,
    url: 'www.sctu.edu.cn/jwc/',
};

async function handler(ctx: Context) {
    const { category = 'tzgg' } = ctx.req.param();
    const link = `https://www.sctu.edu.cn/jwc/wenzhangg/${category}.htm`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.main_conRCb ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                return {
                    ...item,
                    description: $('.v_news_content').html(),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
