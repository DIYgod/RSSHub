// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { isValidHost } from '@/utils/valid-host';

const shortcuts = {
    potd: 'picture/browse/potd/',
    potw: 'picture/browse/potw/',
    potm: 'picture/browse/potm/',
};

export default async (ctx) => {
    const language = ctx.req.param('language') ?? '';
    const category = ctx.req.param('category') ?? 'figure';
    if (language && !isValidHost(language)) {
        throw new Error('Invalid language');
    }

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/${Object.hasOwn(shortcuts, category) ? shortcuts[category] : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.item-icon, .picture-icon')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            const link = item.attr('href');

            return {
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('.headline').text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        pictures: /myfigurecollection\.net\/picture\//.test(item.link)
                            ? [{ src: content('meta[property="og:image"]').attr('content') }]
                            : JSON.parse(decodeURIComponent(content('meta[name="pictures"]').attr('content'))),
                        fields: content('.form-field')
                            .toArray()
                            .map((f) => ({
                                key: content(f).find('.form-label').text(),
                                value: content(f).find('.form-input').text(),
                            })),
                    });
                } catch {
                    item.title = `Item #${item.link.split('/').pop()}`;
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    });
};
