import { load } from 'cheerio';
import { getMimeType } from 'hono/utils/mime';
import pMap from 'p-map';

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
    path: '/:path{.+}?',
    name: '国家药品监督管理局医疗器械标准管理中心 - 通用',
    example: '/gov/nifdc/bshff/ylqxbzhgl/qxggtzh',
    parameters: { path: '路径，默认为公告通告' },
    radar: [
        {
            source: ['www.nifdc.org.cn/nifdc/*path/index.html', 'www.nifdc.org.cn/nifdc/*path'],
            target: '/:path',
        },
    ],
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中 \`https://www.nifdc.org.cn/nifdc/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [公告通告](https://www.nifdc.org.cn/nifdc/bshff/ylqxbzhgl/qxggtzh/index.html) 则将对应页面 URL <https://www.nifdc.org.cn/nifdc/bshff/ylqxbzhgl/qxggtzh/index.html> 中 \`https://www.nifdc.org.cn/nifdc/\` 和 \`/index.html\` 之间的字段 \`bshff/ylqxbzhgl/qxggtzh\` 作为路径填入。此时路由为 [\`/gov/nifdc/bshff/ylqxbzhgl/qxggtzh\`](https://rsshub.app/gov/nifdc/bshff/ylqxbzhgl/qxggtzh)

:::`,
};

async function handler(ctx) {
    const { path = 'bshff/ylqxbzhgl/qxggtzh' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(30, limit);

    const rootUrl = 'https://www.nifdc.org.cn';
    const currentUrl = new URL(`nifdc/${path}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.list ul li')
        .slice(0, candidateLimit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');
            const link = a.prop('href');
            const publishedDate = $item.find('span').text().replaceAll(/\(|\)/g, '');

            return {
                title: a.prop('title') || a.text(),
                link: link!.startsWith('http') ? link : new URL(link!, currentUrl).href,
                pubDate: publishedDate ? timezone(parseDate(publishedDate), 8) : undefined,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('.title').text() || item.title;
                item.description = content('div.text').append(content('div.fujian')).html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = [
                    ...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="ColumnKeywords"]').prop('content')?.split(/,|;/) ?? [])]),
                ].filter(Boolean);
                const publishedDate = content('meta[name="PubDate"]').prop('content');
                item.pubDate = publishedDate ? timezone(parseDate(publishedDate), 8) : item.pubDate;
                item.enclosure_url = content('a.fujianClass').first().prop('href');

                if (item.enclosure_url) {
                    const attachmentUrl = new URL(item.enclosure_url, item.link);
                    item.enclosure_url = attachmentUrl.href;
                    item.enclosure_type = (getMimeType(attachmentUrl.pathname) ?? getMimeType(attachmentUrl.pathname, documentMimeTypes))?.split(';', 1)[0];
                }
                return item;
            }),
        { concurrency: 3 }
    );

    const imageSrc = $('div.logo img').prop('src');
    const iconHref = $('link[rel="shortcut icon"]').prop('href');
    const image = imageSrc ? new URL(imageSrc, currentUrl).href : undefined;
    const icon = iconHref ? new URL(iconHref, currentUrl).href : undefined;

    return {
        item: items,
        title: $('title').text().replace(/----/, ' - '),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh' as const satisfies Language,
        image,
        icon,
        logo: icon,
        subtitle: $('meta[ name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
