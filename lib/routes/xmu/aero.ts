import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://aerospace.xmu.edu.cn';

const urlMap = {
    tzgg: '/sy/xydt/tzgg/zjgx.htm',
    bksjw: '/sy/rcpy/bkspy/tzgg.htm',
    yjsjw: '/sy/rcpy/yjspy/tzgg.htm',
};

const titleMap = {
    tzgg: '通知公告',
    bksjw: '本科生教务',
    yjsjw: '研究生教务',
};

export const route: Route = {
    path: '/aero/:type',
    categories: ['university'],
    example: '/xmu/aero/yjsjw',
    parameters: { type: '分类见下表' },
    name: '航空航天学院',
    maintainers: ['jch12138'],
    handler,
    description: `| 通知公告 | 本科生教务 | 研究生教务 |
| :------: | :--------: | :--------: |
|   tzgg   |    bksjw   |    yjsjw   |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    const link = host + urlMap[type];
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.ej_list ul li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const $a = $item.find('a');
            return {
                title: $a.attr('title') ?? '',
                link: new URL($a.attr('href')!, link).href,
                pubDate: parseDate($item.find('.sj').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                item.description = content('.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: titleMap[type],
        link,
        item: items,
    };
}
