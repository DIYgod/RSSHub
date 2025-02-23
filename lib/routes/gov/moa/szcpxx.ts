import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 6;

    const rootUrl = 'http://www.moa.gov.cn';
    const currentUrl = new URL(`ztzl/szcpxx/zyzc/index.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.ztst_list_contBox_inner ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.content');

            return {
                title: a.prop('title'),
                pubDate: parseDate(item.find('div.pubTime').text().split(/：/).pop(), 'YYYY.MM.DD'),
                link: new URL(a.prop('href'), currentUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h2.xxgk_title, h1.bjjMTitle').text();
                const description = $$('div.gsj_htmlcon_bot, div.TRS_Editor').html();
                const guid = `moa-${$$('meta[name="contentid"]').prop('content')}`;

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('meta[name="PubDate"]').prop('content')), +8);
                item.category = [
                    ...new Set([
                        $$('meta[name="SiteName"]').prop('content'),
                        $$('meta[name="ColumnName"]').prop('content'),
                        $$('meta[name="ColumnType"]').prop('content'),
                        $$('meta[name="ContentSource"]').prop('content'),
                        $$('meta[name="Keywords"]').prop('content'),
                    ]),
                ].filter(Boolean);
                item.author = $$('meta[name="Author"]').prop('content') || $$('meta[name="source"]').prop('content');
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: $$('div.gsj_htmlcon_bot, div.TRS_Editor').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = `${$('title').text()} - ${$('li.now').text()}`;
    const image = new URL($('img.leftLogo').prop('src'), currentUrl).href;

    return {
        title,
        description: title,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: '中华人民共和国农业农村部',
        language,
    };
};

export const route: Route = {
    path: '/moa/szcpxx',
    name: '中华人民共和国农业农村部生猪专题重要政策',
    url: 'www.moa.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/moa/szcpxx',
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
            source: ['www.moa.gov.cn/ztzl/szcpxx/zyzc/index.htm'],
            target: '/moa/szcpxx',
        },
    ],
};
