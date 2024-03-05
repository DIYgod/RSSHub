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
    const language = ctx.req.param('language') ?? 'en';
    const category = ctx.req.param('category') ?? 'censored_list';
    const type = ctx.req.param('type') ?? 'all';

    const rootUrl = 'https://7mmtv.sx';
    const currentUrl = `${rootUrl}/${language}/${category}/${type}/1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.video')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('.video-title a');
            return {
                title: title.text(),
                author: item.find('.video-channel').text(),
                pubDate: parseDate(item.find('.small').text()),
                link: title.attr('href'),
                poster: item.find('img').attr('data-src'),
                video: item.find('video').attr('data-src'),
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    cover: content('.content_main_cover img').attr('src'),
                    images: content('.owl-lazy')
                        .toArray()
                        .map((i) => content(i).attr('data-src')),
                    description: content('.video-introduction-images-text').html(),
                    poster: item.poster,
                    video: item.video,
                });

                item.category = content('.categories a')
                    .toArray()
                    .map((a) => content(a).text());

                delete item.poster;
                delete item.video;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title')
            .text()
            .replace(/ - Watch JAV Online/, ''),
        link: currentUrl,
        item: items,
        description: $('meta[name="description"]').attr('content'),
    });
};
