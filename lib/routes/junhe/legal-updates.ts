import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://junhe.com';
    const currentUrl = new URL('legal-updates', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('a.content-wrap')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h1.news.detail').text(),
                pubDate: parseDate(item.find('p.date').text(), 'YYYY.MM.DD'),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.d-title').text();
                const description = $$('div.d-content').html();
                const infos = $$('p.d-pub-date').text().split(/\s/);

                item.title = title;
                item.description = description;
                item.pubDate = parseDate(infos[0], 'YYYY.MM.DD');
                item.author = infos.slice(1).join('/');
                item.content = {
                    html: description,
                    text: $$('div.d-content').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('a.site-logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: '君合律师事务所',
        language,
    };
};

export const route: Route = {
    path: '/legal-updates',
    name: '君合法评',
    url: 'junhe.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/junhe/legal-updates',
    description: '',
    categories: ['new-media'],

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
            source: ['/legal-updates'],
            target: '/legal-updates',
        },
    ],
};
