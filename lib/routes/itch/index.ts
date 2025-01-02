import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://itch.io';
    const currentUrl = `${rootUrl}${getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.title.game_link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.author = content('title').text().split('by ').pop();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: content('.screenshot')
                        .toArray()
                        .map((i) => content(i).attr('src')),
                    description: content('.formatted_description').html(),
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
