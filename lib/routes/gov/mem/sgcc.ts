import { load } from 'cheerio';
import { getMimeType } from 'hono/utils/mime';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const documentMimeTypes = {
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const route: Route = {
    path: '/gk/sgcc/:category?',
    categories: ['government'],
    example: '/gov/mem/gk/sgcc/tbzdsgdcbg',
    parameters: { category: '分类，见下表，默认为挂牌督办' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.mem.gov.cn/gk/sgcc/:category'],
            target: '/gk/sgcc/:category',
        },
    ],
    name: '事故及灾害查处',
    maintainers: ['nczitzk'],
    handler,
    description: `| 挂牌督办 | 调查报告   |
| -------- | ---------- |
| sggpdbqk | tbzdsgdcbg |`,
};

async function handler(ctx) {
    const { category = 'sggpdbqk' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.mem.gov.cn';
    const currentUrl = new URL(`gk/sgcc/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('table.center_main02')
        .find('a[title]')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            const regExp = new RegExp(String.raw`\/sgcc\/${category}\/\.\.\.`);
            const link = new URL(`${category}/${$item.prop('href')!.replace(/\.\//, '')}`, currentUrl).href.replace(regExp, '');

            const pathname = new URL(link).pathname;
            const mimeType = (getMimeType(pathname) ?? getMimeType(pathname, documentMimeTypes))?.split(';', 1)[0];
            const enclosureType = mimeType && mimeType !== 'text/html' && mimeType !== 'application/xhtml+xml' ? mimeType : undefined;

            const pubDate = $item.find('span').text();
            return {
                title: $item.contents().first().text(),
                link,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                enclosure_url: enclosureType ? link : undefined,
                enclosure_type: enclosureType,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.endsWith('html')) {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.description = content('#content').html();
                }
                return item;
            })
        )
    );

    const icon = new URL($('link[rel="shortcut icon"]').prop('href')!, rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh' as const satisfies Language,
        image: new URL($('#imag').prop('src')!, rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
