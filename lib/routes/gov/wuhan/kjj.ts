import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/kjj/:caty',
    categories: ['government'],
    example: '/gov/wuhan/kjj/tzgg',
    parameters: {
        caty: '类别',
    },
    name: '武汉市科学技术局 - 新闻中心',
    maintainers: ['tudou027'],
    handler,
    description: `| 通知公告 | 公示信息 |
| :------: | :------: |
|   tzgg   |   gsxx   |`,
};

const rootUrl = 'https://kjj.wuhan.gov.cn/';

const config = {
    tzgg: {
        link: '/wmfw/tzgg/tzgg_18371/',
        title: '通知公告',
    },
    gsxx: {
        link: '/wmfw/tzgg/gsxx/',
        title: '公示信息',
    },
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!cfg) {
        throw new InvalidParameterError('Bad category. See docs');
    }

    const currentUrl = new URL(cfg.link, rootUrl).href;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('div.list_news li')
        .slice(0, 20)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a[href]');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: parseDate($item.find('span').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!);
                const content = load(res);

                item.description = content('div.art_content').html();
                return item;
            })
        )
    );

    return {
        title: `武汉科技局 - ${cfg.title}`,
        link: rootUrl,
        item: items,
    };
}
