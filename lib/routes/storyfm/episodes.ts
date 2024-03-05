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
    const rootUrl = 'https://storyfm.cn';
    const currentUrl = `${rootUrl}/episodes-list/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.e-ep')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2.e-ep__title a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.whitespace-nowrap').text()),
                enclosure_type: 'audio/mpeg',
                enclosure_url: item.find('audio source').attr('src'),
                itunes_item_image: item.find('.zoom-image-container-progression img').attr('src'),
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

                item.author = content('.rs-post__author').text().replace(/By/, '').trim();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    audio: item.enclosure_url,
                    description: content('.rs-post__content').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '故事FM',
        link: currentUrl,
        item: items,
        itunes_author: '故事FM',
        image: $('.custom-logo-link img').attr('src'),
    });
};
