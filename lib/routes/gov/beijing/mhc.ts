import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/mhc/:caty',
    categories: ['government'],
    example: '/gov/beijing/mhc/wnxw',
    parameters: { caty: '类别' },
    name: '卫生健康委员会 - 新闻中心',
    maintainers: ['luyuhuang'],
    handler,
    description: `| 委内新闻 | 基层动态 | 媒体聚焦 | 热点新闻 |
| :------: | :------: | :------: | :------: |
|   wnxw   |   jcdt   |   mtjj   |   rdxws  |`,
};

const rootUrl = 'https://wjw.beijing.gov.cn/';

const config = {
    wnxw: {
        link: '/xwzx_20031/wnxw/',
        title: '委内新闻',
    },
    jcdt: {
        link: '/xwzx_20031/jcdt/',
        title: '基层动态',
    },
    mtjj: {
        link: '/xwzx_20031/mtjj/',
        title: '媒体聚焦',
    },
    rdxws: {
        link: '/xwzx_20031/rdxws/',
        title: '热点新闻',
    },
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui">docs</a>');
    }

    const currentUrl = new URL(cfg.link, rootUrl).href;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('div.weinei_left_con div.weinei_left_con_line')
        .toArray()
        .slice(0, 10)
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a[title]');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: timezone(parseDate($item.find('div.weinei_left_con_line_date').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('div.weinei_left').html();
                return item;
            })
        )
    );

    return {
        title: `北京卫健委 - ${cfg.title}`,
        link: rootUrl,
        item: items,
    };
}
