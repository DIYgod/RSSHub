import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.cuit.edu.cn';

export const route: Route = {
    path: '/cxxww/:category{.+}?',
    categories: ['university'],
    example: '/cuit/cxxww/zhxw',
    parameters: {
        category: {
            description: '分类',
            options: [
                { value: 'zhxw', label: '综合新闻' },
                { value: 'tzgg', label: '通知公告' },
                { value: 'cxyw', label: '成信要闻' },
                { value: 'cxxs', label: '成信学术' },
                { value: 'mtcx', label: '媒体成信' },
                { value: 'cxwh/whhd', label: '文化活动' },
            ],
            default: 'zhxw',
        },
    },
    radar: [
        {
            source: ['www.cuit.edu.cn/index/:category'],
        },
    ],
    name: '成信新闻网',
    maintainers: ['luojunyuan'],
    handler,
    url: 'www.cuit.edu.cn',
};

async function handler(ctx: Context): Promise<Data> {
    const { category = 'zhxw' } = ctx.req.param();
    const link = `${baseUrl}/index/${category.replace(/\.htm$/, '')}.htm`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.newlist1 ul.list li a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h3').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                item.author = $('.conttime span')
                    .toArray()
                    .map((e) => $(e).text().trim())
                    .find((text) => text.startsWith('作者'))
                    ?.slice(3);
                item.description = $('.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        language: 'zh-CN',
        item: items,
    };
}
