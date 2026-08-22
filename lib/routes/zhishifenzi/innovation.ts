import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/innovation/:type?',
    categories: ['study'],
    example: '/zhishifenzi/innovation/company',
    parameters: { type: 'type，eg. company' },
    name: 'innovation',
    maintainers: ['y9c'],
    handler,
    description: `| \`:type\`       | type name     |
| ------------- | ------------- |
| ~~multiple~~  | ~~Multiple~~  |
| company       | Company       |
| product       | Product       |
| technology    | Technology    |
| ~~character~~ | ~~Character~~ |
| policy        | Policy        |

> leave it blank（\`/zhishifenzi/innovation\`）to get all`,
};

const base = 'https://zhishifenzi.com';

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    const link = type === undefined ? `${base}/innovation` : `${base}/innovation/${type}`;
    const response = await ofetch(link);
    const $ = load(response);

    const navTitle = $('div.innovation_nav > ul > li.sel').text().split('：').pop();
    const title = navTitle === '' ? '全部創新' : `創新「${navTitle}」`;

    const list: DataItem[] = $('div.inner_news_list > ul > li.clearfix')
        .toArray()
        .slice(0, 4)
        .map((elem) => {
            const $elem = $(elem);
            return {
                title: $elem.find('div > h5 > a').text(),
                pubDate: parseRelativeDate($elem.find('span').first().text()),
                link: new URL($elem.find('div > h5 > a').attr('href')!, base).href,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const detailCapture = load(detailResponse);

                item.description = detailCapture('.main div.inner_content').html();

                return item;
            })
        )
    );

    return {
        title: `知識分子 | ${title}`,
        description: '知識分子 | 科學 文明 智慧',
        link,
        item: out,
    };
}
