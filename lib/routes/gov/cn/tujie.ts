import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xinwen/tujie/:caty',
    categories: ['government'],
    example: '/gov/cn/xinwen/tujie/zhengce',
    parameters: { caty: '图解分类，见下表' },
    name: '图解',
    maintainers: ['nczitzk'],
    description: `| 图解政策 |
| -------- |
| zhengce  |`,
    handler,
};

const config = {
    zhengce: {
        link: 'https://www.gov.cn/xinwen/tujie/zhengce/',
        title: '图解政策',
    },
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#zhong-guo-zheng-fu-tu-jie">docs</a>');
    }

    const currentUrl = cfg.link;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('div.tplgd')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const a = $(item).find('a').eq(1);
            return {
                title: a.text().trim(),
                link: a.attr('href'),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('div.pages_content').html();
                item.pubDate = timezone(parseDate(content('div.pages-date').text().split('来源：', 1)[0]), 8);

                return item;
            })
        )
    );

    return {
        title: `${cfg.title} - 中国政府网`,
        link: currentUrl,
        item: items,
    };
}
