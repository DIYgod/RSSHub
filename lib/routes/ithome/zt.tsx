import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { id = 'xijiayi' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.ithome.com';
    const currentUrl = new URL(`zt/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const author = 'IT之家';
    const language = 'zh';

    let items = $('div.newsbody')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h2').text();
            const image = item.find('img').prop('data-original') ?? item.find('img').prop('src');

            return {
                title,
                pubDate: timezone(
                    parseDate(
                        item
                            .find('span.time script')
                            .text()
                            .match(/'(.*?)'/)
                    ),
                    +8
                ),
                link: item.find('a').first().prop('href'),
                author: item.find('div.editor').contents().first().text(),
                image,
                banner: image,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('p.ad-tips, a.topic-bar').remove();

                $$('div#paragraph p img').each((_, el) => {
                    el = $$(el);

                    const src = el.prop('data-original');

                    if (src) {
                        const alt = el.prop('alt');
                        el.replaceWith(renderToString(<figure>{alt ? <img src={src} alt={alt} /> : <img src={src} />}</figure>));
                    }
                });

                const title = $$('h1').text();
                const description = $$('div#paragraph').html();
                const image = $$('div#paragraph img').first().prop('src');

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('span#pubtime_baidu').text()), +8);
                item.category = $$('div.cv a')
                    .toArray()
                    .map((c) => $$(c).text())
                    .slice(1);
                item.author = $$('span#author_baidu').contents().last().text() || $$('span#source_baidu').contents().last().text() || $$('span#editor_baidu').contents().last().text();
                item.content = {
                    html: description,
                    text: $$('div#paragraph').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('meta[property="og:image"]').prop('content'), rootUrl).href;

    return {
        title: `${author} - ${$('title').text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/zt/:id?',
    name: '专题',
    url: 'ithome.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/ithome/zt/xijiayi',
    parameters: { category: '专题 id，默认为 xijiayi，即 [喜加一](https://www.ithome.com/zt/xijiayi)，可在对应专题页 URL 中找到' },
    description: `::: tip
  更多专题请见 [IT之家专题](https://www.ithome.com/zt)
:::`,
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
            source: ['ithome.com/zt/:id'],
            target: '/zt/:id',
        },
    ],
};
