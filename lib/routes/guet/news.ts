import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xwzx/:type?',
    categories: ['university'],
    example: '/guet/xwzx/xykx',
    parameters: { type: '资讯类型，如下表' },
    name: '新闻资讯',
    maintainers: ['cssxsh'],
    description: `| 桂电要闻 | 校园快讯 | 媒体桂电 | 通知公告 | 校内通知 | 学术信息 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| gdyw     | xykx     | mtgd     | tzgg     | xntz     | xsxx     |`,
    handler,
};

const host = 'https://www.guet.edu.cn';

const paths = {
    gdyw: 'gdyw_6356',
    xykx: 'xykx',
    mtgd: 'mtgd',
    tzgg: 'tzgg',
    xntz: 'xntz',
    xsxx: 'xsxx',
};

async function handler(ctx: Context) {
    const { type = 'gdyw' } = ctx.req.param();
    const path = paths[type];
    if (!path) {
        throw new Error('参数不在可选范围之内');
    }
    const url = `${host}/${path}/list.htm`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.news_list li.news')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const a = $item.find('.news_title a');
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, host).href,
                description: $item.find('.news_text a').text(),
                pubDate: parseDate($item.find('.news_date').text(), 'YYYY-MM-DD'),
            };
        });

    const item = await Promise.all(
        list.map((item) => {
            if (!item.link.startsWith(`${host}/`)) {
                return item;
            }
            return cache.tryGet(item.link, async () => {
                const result = await ofetch(item.link);
                const $$ = load(result);
                item.description = $$('.wp_articlecontent').html() ?? item.description;
                const time = $$('.arti_metas')
                    .text()
                    .match(/发布时间：\s*(\d+)年(\d+)月(\d+)日\s*(\d+)时(\d+)分/);
                if (time) {
                    item.pubDate = timezone(parseDate(`${time[1]}-${time[2]}-${time[3]} ${time[4]}:${time[5]}`), 8);
                }
                return item;
            });
        })
    );

    return {
        title: $('.col_news_head h2').text(),
        link: url,
        item,
    };
}
