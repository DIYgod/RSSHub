import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category',
    categories: ['government'],
    example: '/gov/nanjing/news',
    parameters: {
        category: '分类名',
    },
    description: `| 南京信息 |  部门动态  | 各区动态 |  民生信息  |
| :------: | :--------: | :------: | :--------: |
|   news   | department | district | livelihood |`,
    name: '信息公开',
    maintainers: ['ocleo1'],
    handler,
};

const host = 'https://www.nanjing.gov.cn';

const categories: Record<string, string> = {
    news: 'njxx',
    department: 'bmdt',
    district: 'gqdt',
    livelihood: 'msxx',
};

async function handler(ctx: Context): Promise<Data> {
    const { category } = ctx.req.param();
    const path = categories[category];

    if (!path) {
        throw new Error('Cannot find page');
    }

    const link = `${host}/${path}/`;
    const response = await ofetch(`${link}index.html`);
    const $ = load(response);

    const items = $('.center ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $aTag = $item.find('a');

            return {
                title: $aTag.text(),
                description: $aTag.attr('title'),
                pubDate: timezone(parseDate($item.find('span').text()), 8),
                link: new URL($aTag.attr('href')!, link).href,
            };
        });

    const title = $('.zxft_title span').text();

    return {
        title,
        link,
        description: `${title} - ${$('head title').text()}`,
        item: items as DataItem[],
    };
}
