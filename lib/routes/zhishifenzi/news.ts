import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:type?',
    categories: ['study'],
    example: '/zhishifenzi/news/ai',
    parameters: { type: 'type，eg. ai' },
    name: 'News',
    maintainers: ['y9c'],
    handler,
    description: `| \`:type\`   | type name |
| --------- | --------- |
| biology   | Biology   |
| medicine  | Medicine  |
| ai        | AI        |
| physics   | physics   |
| chymistry | Chymistry |
| astronomy | Astronomy |
| others    | Others    |

> leave it blank（\`/zhishifenzi/news\`）to get all`,
};

const titles = {
    multiple: '综合',
    biology: '生物',
    medicine: '医药',
    ai: '人工智能',
    physics: '物理',
    chymistry: '化学',
    astronomy: '天文',
    other: '其他',
};

async function handler(ctx: Context) {
    const { type = 'multiple' } = ctx.req.param();

    const rootUrl = 'https://zhishifenzi.com';
    const currentUrl = `${rootUrl}/news/ajaxarticles`;
    const response = await ofetch(currentUrl, {
        method: 'POST',
        body: new URLSearchParams({ category: type }),
    });

    const $ = load(response);
    const list = $('h5 a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        }) as DataItem[];

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.inner_content').html();
                item.pubDate = parseRelativeDate(content('.inner_view_from').text());

                return item;
            })
        )
    );

    return {
        title: `知識分子 | 資訊「${titles[type] || '综合'}」`,
        description: '知識分子 | 科學 文明 智慧',
        link: `${rootUrl}/news`,
        item: out,
    };
}
