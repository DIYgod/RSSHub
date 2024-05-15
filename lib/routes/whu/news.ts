import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

import { domain, processMeta, getMeta, processItems } from './util';

export const route: Route = {
    path: '/news/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'wdzx/wdyw' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

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
