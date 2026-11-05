import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const limit = getRouteLimit(ctx, 15);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(15, limit);

    const rootUrl = 'https://zfxxgk.ndrc.gov.cn';
    const currentUrl = new URL('web/dirlist.jsp', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    $('th').parent().remove();

    let items = $('div.zwxxkg-result tr')
        .slice(0, candidateLimit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            const a = $item.find('a.xxgk_list1');
            const publishedDate = $item.find('td').last().text().trim();

            return {
                title: a.text(),
                pubDate: publishedDate ? timezone(parseDate(publishedDate), 8) : undefined,
                link: new URL(a.prop('href')!, currentUrl).href,
                language,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('meta[name="ArticleTitle"]').prop('content');
                const article = $$('div.article, div.zhengwen').first();
                article.append($$('table.enclosure, div.downloadbtn'));
                const description = article.html();

                item.title = title || item.title;
                item.description = description;
                item.category = [...new Set([$$('meta[name="ContentSource"]').prop('content'), $$('meta[name="ColumnName"]').prop('content'), $$('meta[name="ColumnType"]').prop('content')])].filter(Boolean);
                item.author = $$('meta[name="ContentSource"]').prop('content');
                item.content = {
                    html: description,
                    text: article.text(),
                };
                item.language = language;
                item.enclosure_url = $$('table.enclosure a.xxgk_list1').length === 0 ? undefined : new URL($$('table.enclosure a.xxgk_list1').first().prop('href')!, currentUrl).href;
                item.enclosure_title = item.enclosure_url ? $$('table.enclosure a.xxgk_list1').first().text() : undefined;

                return item;
            }),
        { concurrency: 3 }
    );

    const imageSrc = $('div.zwgklogo img').prop('src');
    const image = imageSrc ? new URL(imageSrc, currentUrl).href : undefined;

    return {
        title: `${$('meta[name="SiteName"]').prop('content')} - ${$('div.zwgktoptitle').text()}`,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: $('meta[name="SiteName"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/zfxxgk',
    name: '政府信息公开',
    url: 'zfxxgk.ndrc.gov.cn',
    maintainers: ['howfool', 'nczitzk'],
    handler,
    example: '/gov/ndrc/zfxxgk',
    parameters: undefined,
    description: undefined,
    categories: ['government'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zfxxgk.ndrc.gov.cn/web/dirlist.jsp'],
            target: '/zfxxgk',
        },
    ],
};
