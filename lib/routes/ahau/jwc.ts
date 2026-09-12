import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/ahau/jwc/jwyw',
    parameters: { type: '类型名' },
    name: '教务处',
    maintainers: ['SimonHu-HN'],
    handler,
    description: `| 教务要闻 | 通知公告 |
| -------- | -------- |
| jwyw     | tzgg     |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const host = 'https://jwc.ahau.edu.cn/xz/wzsy/';
    const link = `${host}${type}.htm`;

    const response = await ofetch(link);
    const $ = load(response);
    const title = $('meta[name="pageTitle"]').attr('content');

    const list = $('.list li a.clearfix, .w-list li a').slice(0, 20).toArray();

    const result = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const itemUrl = new URL($item.attr('href')!, host).href;
            return cache.tryGet(itemUrl, async () => {
                const detail = await ofetch(itemUrl);
                const $$ = load(detail);
                return {
                    title: $item.attr('title')!,
                    link: itemUrl,
                    author: '安农大教务处',
                    guid: itemUrl,
                    description: $$('#vsb_content > .v_news_content').html(),
                    pubDate: timezone(
                        parseDate(
                            $$('.wzxx')
                                .text()
                                .match(/\d{4}-\d{2}-\d{2}/)![0]
                        ),
                        8
                    ),
                };
            });
        })
    );

    return {
        title: `安徽农业大学教务处 - ${title}`,
        link,
        description: `安徽农业大学教务处 - ${title}`,
        item: result,
    };
}
