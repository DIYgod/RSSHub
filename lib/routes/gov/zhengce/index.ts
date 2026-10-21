import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category{.+}?',
    categories: ['government'],
    example: '/gov/zhengce',
    parameters: { category: '分类，见下表，默认为最新' },
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
            source: ['www.gov.cn/zhengce/', 'www.gov.cn/zhengce/index.htm', 'www.gov.cn/zhengce/zuixin/', 'www.gov.cn/zhengce/zuixin/index.htm'],
            target: '/',
        },
        {
            source: ['www.gov.cn/zhengce/jiedu/', 'www.gov.cn/zhengce/jiedu/index.htm'],
            target: '/jiedu',
        },
        {
            source: ['www.gov.cn/zhengce/jiedu/tujie/', 'www.gov.cn/zhengce/jiedu/tujie/index.htm'],
            target: '/jiedu/tujie',
        },
    ],
    name: '政策',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.gov.cn/zhengce/',
    description: `| 最新政策 | 政策解读 | 图解政策    |
| -------- | -------- | ----------- |
| zuixin   | jiedu    | jiedu/tujie |`,
};

export async function handler(ctx) {
    const { category = 'zuixin' } = ctx.req.param();
    const limit = getRouteLimit(ctx);

    const rootUrl = 'https://www.gov.cn';
    let currentUrl = new URL(`zhengce/${category.replace(/\/$/, '')}/`, rootUrl).href;

    let { data: response } = await got(currentUrl);
    const redirect = response.match(/window\.location\.href\s*=\s*["']([^"']+)["']/)?.[1];
    if (redirect) {
        const redirectUrl = new URL(redirect, currentUrl);
        if (redirectUrl.origin === rootUrl) {
            currentUrl = redirectUrl.href;
            response = (await got(currentUrl)).data;
        }
    }

    const $ = load(response);

    const listDataPath = response.match(/url:\s*["'](\.\/[^"']+\.json)["']/)?.[1];
    // The source renders twenty records from its JSON archive on the first page.
    let items: DataItem[] = listDataPath
        ? (await ofetch<Array<{ TITLE: string; URL: string }>>(new URL(listDataPath, currentUrl).href)).slice(0, 20).map((item) => ({ title: item.TITLE, link: new URL(item.URL, currentUrl).href }))
        : $('h4 a, div.subtitle a[title]')
              .toArray()
              .map((item): DataItem => {
                  const $item = $(item);

                  const link = $item.prop('href');

                  return {
                      title: $item.text(),
                      link: link!.startsWith('http') ? link : new URL(link!, currentUrl).href,
                  };
              });

    items = items.filter((item) => /https?:\/\/www\.gov\.cn\/zhengce.*content_\d+\.htm/.test(item.link!));
    // Detail metadata refines the list's calendar dates, so keep the source's
    // first page until core sorts it unless native ordering is requested.
    if (ctx.req.query('sorted') === 'false' && limit !== undefined) {
        items = items.slice(0, limit);
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const processElementText = (el) => content(el).text().split(/：/).pop()!.trim() || content(el).next().text().trim();

                const author = content('meta[name="author"]').prop('content');

                const agencyEl = content('table.bd1')
                    .find('td')
                    .toArray()
                    .findLast((a) => content(a).text().startsWith('发文机关'));

                const sourceEl = content('span.font-zyygwj')
                    .toArray()
                    .findLast((a) => content(a).text().startsWith('来源'));

                const subjectEl = content('table.bd1')
                    .find('td')
                    .toArray()
                    .findLast((a) => content(a).text().startsWith('主题分类'));

                const agency = agencyEl ? processElementText(agencyEl) : undefined;
                const source = sourceEl ? processElementText(sourceEl) : undefined;
                const subject = subjectEl ? processElementText(subjectEl) : content('td.zcwj_ztfl').text();

                const column = content('meta[name="lanmu"]').prop('content');
                const keywords = content('meta[name="keywords"]').prop('content')?.split(/;|,/) ?? [];
                const manuscriptId = content('meta[name="manuscriptId"]').prop('content');

                item.title = content('meta[name="ArticleTitle"]').prop('content') || content('div.share-title').first().text() || item.title;
                item.description = content('div.TRS_UEDITOR').first().html() || content('div#UCAP-CONTENT, td#UCAP-CONTENT').first().html();
                item.author = [agency, source, author].filter(Boolean).join('/');
                item.category = [...new Set([subject, column, ...keywords].filter(Boolean))];
                item.guid = manuscriptId ? `gov-zhengce-${manuscriptId}` : item.link;
                const published = content('meta[name="firstpublishedtime"]').prop('content');
                const modified = content('meta[name="lastmodifiedtime"]').prop('content');
                item.pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD-HH:mm:ss'), 8) : undefined;
                item.updated = modified ? timezone(parseDate(modified, 'YYYY-MM-DD-HH:mm:ss'), 8) : undefined;

                return item;
            })
        )
    );

    const imageSrc = $('img.wordlogo').prop('src');
    const iconSrc = $('link[rel~="icon"]').prop('href');
    const image = imageSrc ? new URL(imageSrc, rootUrl).href : undefined;
    const icon = iconSrc ? new URL(iconSrc, rootUrl).href : undefined;
    const subtitle = $('meta[name="lanmu"]').prop('content');
    const author = $('div.header_logo a[aria-label]').prop('aria-label');

    return {
        item: items,
        title: author && subtitle ? `${author} - ${subtitle}` : $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN' as const satisfies Language,
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
}
