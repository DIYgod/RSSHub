// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.thoughtco.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a[data-doc-id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('span.block-title').text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.adslot').remove();
                content('div.sources-and-citation, .mntl-figure-caption svg').remove();
                content('div.figure-media').each((_, e) => {
                    e = $(e);

                    const image = e.find('img');

                    e.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: image.prop('data-src'),
                                width: image.prop('width'),
                                height: image.prop('height'),
                            },
                        })
                    );
                });

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: content('meta[property="og:image"]').prop('content'),
                    },
                    description: content('div.article-content').html(),
                });
                item.author = content('meta[name="sailthru.author"]').prop('content');
                item.category = [
                    ...new Set(
                        content('meta[name="parsely-tags"]')
                            .prop('content')
                            ?.split(/,/)
                            .map((c) => c.trim())
                    ),
                ];
                item.pubDate = parseDate(detailResponse.match(/"datePublished": "(.*?)"/)[1]);
                item.updated = parseDate(detailResponse.match(/"dateModified": "(.*?)"/)[1]);

                return item;
            })
        )
    );

    const author = $('meta[property="og:site_name"]').prop('content');
    const title = $('meta[property="og:title"]').prop('content');
    const icon = new URL($('link[rel="apple-touch-icon-precomposed"]').prop('href'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author}${title.startsWith(author) ? '' : ` - ${title}`}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:title"]').prop('content'),
        author,
    });
};
