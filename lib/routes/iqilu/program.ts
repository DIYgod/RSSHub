import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/v/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'sdws/sdxwlb' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://v.iqilu.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('#jmzhanshi1 dl')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();
            const image = item.find('img').first();

            item.find('dd').last().remove();

            return {
                title: a.prop('title'),
                link: a.prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: image.prop('src'),
                        alt: image.prop('alt'),
                    },
                }),
                pubDate: parseDate(
                    item
                        .find('dd')
                        .last()
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)[1]
                ),
                itunes_item_image: image.prop('src'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.vtitle').text();
                item.enclosure_url = content('#copy_mp4text').prop('value');
                item.enclosure_type = item.enclosure_url ? `video/${item.enclosure_url.split(/\./).pop()}` : undefined;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item.itunes_item_image,
                        alt: item.title,
                    },
                    video: {
                        src: item.enclosure_url,
                        type: item.enclosure_type,
                    },
                    description: content('div.vinfo').text().trim(),
                });

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;
    const author = $('div.host_pic dl dd a')
        .toArray()
        .map((a) => $(a).text())
        .join('/');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('div.s_logo img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
    };
}
