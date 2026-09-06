import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';

import { wafFetch } from './utils';

export const route: Route = {
    path: '/ziyouxing/:code',
    categories: ['travel'],
    example: '/mafengwo/ziyouxing/10186',
    parameters: { code: '目的地代码，可在该目的地页面的 URL 中找到' },
    description: '目的地代码请参见 [这里](http://www.mafengwo.cn/mdd/)',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自由行',
    maintainers: ['nczitzk'],
    handler,
};

const baseUrl = 'https://www.mafengwo.cn';

async function handler(ctx: Context) {
    const { code } = ctx.req.param();
    const rootUrl = `${baseUrl}/gonglve/ziyouxing/list/list_page?mddid=${code}&page=1`;

    const response = await wafFetch<{ html: string }>(rootUrl);
    const $ = load(response.html);

    const items = $('div.item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const summary = $item
                .find('ul li')
                .toArray()
                .map((li) => `<li>${$(li).text()}</li>`)
                .join('');

            return {
                title: $item.find('h3').text(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                description: `<img src="${$item.find('img').attr('src')}"><ul>${summary}</ul>`,
                category: [$item.find('span.location').text()],
            };
        });

    const titleResponse = await wafFetch<string>(`${baseUrl}/gonglve/ziyouxing/mdd_${code}/`);
    const title = load(titleResponse);

    return {
        title: title('title').text(),
        link: rootUrl,
        item: items,
    };
}
