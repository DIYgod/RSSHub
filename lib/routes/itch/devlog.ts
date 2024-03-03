// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const user = ctx.req.param('user') ?? '';
    const id = ctx.req.param('id') ?? '';
    if (!isValidHost(user)) {
        throw new Error('Invalid user');
    }

    const rootUrl = `https://${user}.itch.io/${id}/devlog`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    let items = $('.title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: timezone(parseDate(item.text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = detailResponse.data.match(/"author":{".*?","name":"(.*?)"/)[1];
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*?)"/)[1]);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: content('.post_image')
                        .toArray()
                        .map((i) => content(i).attr('src')),
                    description: content('.post_body').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    });
};
