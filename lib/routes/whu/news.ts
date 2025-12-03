import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { domain, getMeta, processItems, processMeta } from './util';

export const route: Route = {
    path: '/news/:category{.+}?',
    categories: ['university'],
    example: '/whu/news',
    parameters: { category: '新闻栏目，可选' },
    name: '新闻网',
    maintainers: [],
    handler,
    description: `
category 参数可选，范围如下:

| 新闻栏目 | 武大资讯 | 学术动态 | 珞珈影像 | 武大视频 |
| -------- | -------- | -------- | -------- | -------- |
| 参数     |  0 或 \`wdzx/wdyw\`  | 1 或 \`kydt\` | 2 或 \`stkj/ljyx\` | 3 或 \`stkj/wdsp\` |

此外 route 后可以加上 \`?limit=n\` 的查询参数，表示只获取前 n 条新闻；如果不指定默认为 10。
`,
};

const parseCategory = (category: string | number) => {
    const outputs = ['wdzx/wdyw', 'kydt', 'stkj/ljyx', 'stkj/wdsp'];
    if (['0', '1', '2', '3'].includes(category)) {
        return outputs[category];
    }
    if (outputs.includes(category)) {
        return category;
    }
    return 'wdzx/wdyw';
};

async function handler(ctx) {
    let { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    category = parseCategory(category);

    const rootUrl = `https://news.${domain}`;
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    // The elements where the information is located vary with the category.
    // 武大资讯 https://news.whu.edu.cn/wdzx/wdyw.htm => ul.wdzxList li a[title]
    // 学术动态 https://news.whu.edu.cn/kydt.htm      => ul.xsdtList li a
    // 珞珈影像 https://news.whu.edu.cn/stkj/ljyx.htm => div.topPic a[title], ul.nypicList li a[title]
    // 武大视频 https://news.whu.edu.cn/stkj/wdsp.htm => div.topVid a[title], ul.nyvidList li a[title]
    let items = $('ul.wdzxList li a[title], ul.xsdtList li a, div.topPic a[title], ul.nypicList li a[title], div.topVid a[title], ul.nyvidList li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const image = item.find('div.img img');

            return {
                title: item.prop('title') ?? item.find('h4.eclips').text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('time').text(), ['YYYY.MM.DD', 'DDYYYY.MM']),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    description: item.find('div.txt p').html(),
                    image: image.prop('src')
                        ? {
                              src: new URL(image.prop('src'), rootUrl).href,
                              alt: image.prop('alt'),
                          }
                        : undefined,
                }),
            };
        });

    items = await processItems(items, cache.tryGet, rootUrl);

    const meta = processMeta(response);
    const siteName = getMeta(meta, 'SiteName');
    const columnName = getMeta(meta, 'ColumnName');

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${siteName} - ${columnName}`,
        link: currentUrl,
        description: getMeta(meta, 'description'),
        language: $('html').prop('lang'),
        image: new URL($('div.logo img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: columnName,
        author: siteName,
        allowEmpty: true,
    };
}
