import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 7;

    const rootUrl = 'https://app.xinhuanet.com';
    const currentUrl = new URL('news/index.html', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('a.article-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('div.article-title').text();
            const guid = `xinhuanet-${item.prop('data-uuid')}`;

            return {
                title,
                link: item.prop('href'),
                guid,
                id: guid,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.article_title').text();
                const description = $$('#detail-content').html();

                item.title = title;
                item.description = description;

                const authorEl = $$('div.article_auth div').first();
                item.author = authorEl.text();

                authorEl.remove();

                item.pubDate = timezone(parseDate($$('div.article_auth div').first().text()), +8);
                item.content = {
                    html: description,
                    text: $$('#detail-content').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = $('meta[itemprop="image"]').prop('content');

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[itemprop="name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/app',
    name: '客户端',
    url: 'app.xinhuanet.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/xinhuanet/app',
    parameters: undefined,
    description: '',
    categories: ['traditional-media'],

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
            source: ['app.xinhuanet.com'],
            target: '/app',
        },
    ],
};
