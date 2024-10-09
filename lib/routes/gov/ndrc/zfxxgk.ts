import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://zfxxgk.ndrc.gov.cn';
    const currentUrl = new URL('web/dirlist.jsp', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    $('th').parent().remove();

    let items = $('div.zwxxkg-result tr')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.xxgk_list1');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('td').last().text()),
                link: new URL(a.prop('href'), currentUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('meta[name="ArticleTitle"]').prop('content');
                const description = $$('div.zwgkdetail').html();

                item.title = title;
                item.description = description;
                item.category = [...new Set([$$('meta[name="ContentSource"]').prop('content'), $$('meta[name="ColumnName"]').prop('content'), $$('meta[name="ColumnType"]').prop('content')])].filter(Boolean);
                item.author = $$('meta[name="ContentSource"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div.article').text(),
                };
                item.language = language;
                item.enclosure_url = $$('table.enclosure a.xxgk_list1').length === 0 ? undefined : new URL($$('table.enclosure a.xxgk_list1').first().prop('href'), currentUrl).href;
                item.enclosure_title = item.enclosure_url ? $$('table.enclosure a.xxgk_list1').first().text() : undefined;

                return item;
            })
        )
    );

    const image = new URL($('div.zwgklogo img').prop('src'), currentUrl).href;

    return {
        title: `${$('meta[name="SiteName"]').prop('content')} - ${$('div.zwgktoptitle').text()}`,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="SiteName"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: ['/ndrc/zfxxgk'],
    // path: ['/ndrc/zfxxgk', '/ndrc/zfxxgk/iteminfo'],
    name: '中华人民共和国国家发展和改革委员会政府信息公开',
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
            target: '/ndrc/zfxxgk',
        },
    ],
};
