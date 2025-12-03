import path from 'node:path';

import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:id?/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { id = 'news', category = 'china' } = ctx.req.param();
    if (!isValidHost(id)) {
        throw new InvalidParameterError('Invalid id');
    }
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = `http://${id}.m4.cn`;
    const currentUrl = new URL(category ? `/${category.replace(/\/$/, '')}/` : '/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.articleitem0 div.aheader0')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text(),
                link: a.prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: [
                        {
                            src: item.parent().find('div.aimg0 a img').prop('src'),
                            alt: a.text(),
                        },
                    ],
                }),
                category: item
                    .find('a.aclass')
                    .toArray()
                    .map((c) => $(c).text().replaceAll('[]', '').trim()),
                pubDate: timezone(parseDate(item.find('span.atime').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('h1').first().text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    intro: content('div.aintro1, p.cont-summary').text(),
                    description: content('div.content0, div.cont-detail').html(),
                });
                item.category = content('span.dd0 a, a[rel="category"]')
                    .toArray()
                    .map((c) => content(c).text())
                    .slice(1);
                item.pubDate = timezone(parseDate(content('span.atime1, span.post-time').text()), +8);

                return item;
            })
        )
    );

    const image = $('a.logo0_b img').prop('src');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
        allowEmpty: true,
    };
}
