import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/soft/news/:type?',
    categories: ['university'],
    example: '/zzu/soft/news/xyxw',
    parameters: { type: '可选，默认为 `xyxw`' },
    name: '计算机与人工智能学院（软件学院）',
    maintainers: ['nia3y'],
    handler,
    description: `| 参数名称 | 学院动态 | 通知公告 |
| -------- | -------- | -------- |
| 参数     | xyxw     | tzgg     |`,
};

const baseUrl = 'https://www7.zzu.edu.cn/csai/';

const config = {
    xyxw: {
        title: '学院动态',
        url: `${baseUrl}xydt.htm`,
    },
    tzgg: {
        title: '通知公告',
        url: `${baseUrl}tzgg.htm`,
    },
};

async function handler(ctx: Context) {
    const { type = 'xyxw' } = ctx.req.param();
    const { title, url } = config[type];

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.list li')
        .toArray()
        .map((v) => {
            const $v = $(v);
            return {
                link: new URL($v.find('a').attr('href')!, url).href,
                title: $v.find('a').text(),
                pubDate: parseDate($v.find('span').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);

                return {
                    ...item,
                    author: '计算机与人工智能学院',
                    description: $('.v_news_content').html(),
                };
            })
        )
    );

    return {
        title: `郑州大学计算机与人工智能学院 -- ${title}`,
        link: url,
        item: out,
    };
}
