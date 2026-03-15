import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/blog/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'en' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 22;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`blog/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('article[id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('div.title').text();

            return {
                title,
                link: item.find('a.articles-grid-link').prop('href'),
                description: renderDescription({
                    image: {
                        src: item
                            .find('div.articles-grid-img img')
                            .prop('src')
                            .replace(/-\d+x\d+\./, '.'),
                        alt: title,
                    },
                }),
                category: item
                    .find('a.section')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `tradingview-blog-${category}-${item.prop('id')}`,
                pubDate: parseDate(item.find('div.date').text(), 'MMM D, YYYY'),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.entry-content')
                    .find('img')
                    .each((_, e) => {
                        content(e).replaceWith(
                            renderDescription({
                                image: {
                                    src: content(e)
                                        .prop('src')
                                        .replace(/-\d+x\d+\./, '.'),
                                },
                            })
                        );
                    });

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = renderDescription({
                    image: {
                        src: content('meta[property="og:image"]').prop('content'),
                        alt: item.title,
                    },
                    description: content('div.entry-content').html(),
                });
                item.author = content('meta[property="og:site_name"]').prop('content');
                item.category = content('div.sections a.section')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('div.single-date').text(), 'MMM D, YYYY');

                return item;
            }),
        { concurrency: 3 }
    );

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div.site-subtitle').text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('h1.site-title').text(),
    };
}
