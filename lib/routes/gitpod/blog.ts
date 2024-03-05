// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { rootUrl } = require('./utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;
    const response = await got(rootUrl + '/blog');
    const $ = load(response.data);
    let items = $('div[class^="flex justify-center"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                link: rootUrl + item.find('a').attr('href'),
                pubDate: parseDate(item.find('span[class^=date]').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                const headerImg = content('img[class^=max-h]');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    img: headerImg.attr('src'),
                    alt: headerImg.attr('alt'),
                    content: content('div[class^=content-blog]').html(),
                });
                item.author = content('span.avatars a')
                    .toArray()
                    .map((e) => content(e).text().trim())
                    .join(', ');
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl + '/blog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    });

    ctx.set('json', {
        title: $('title').text(),
        link: rootUrl + '/blog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    });
};
