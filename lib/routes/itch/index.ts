import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['game'],
    example: '/itch/games/new-and-popular/featured',
    parameters: { path: 'Params' },
    name: 'Browse',
    maintainers: ['nczitzk'],
    description: `The path is the field after \`itch.io\` in the URL of the corresponding page, e.g. the URL of [Top Rated Games tagged Singleplayer](https://itch.io/games/top-rated/tag-singleplayer) is \`https://itch.io/games/top-rated/tag-singleplayer\`, where the field after \`itch.io\` is \`/games/top-rated/tag-singleplayer\`.

So the route is [\`/itch/games/top-rated/tag-singleplayer\`](https://rsshub.app/itch/games/top-rated/tag-singleplayer).

::: tip
You can browse all the tags [here](https://itch.io/tags).
:::`,
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://itch.io';
    const currentUrl = `${rootUrl}/${ctx.req.param('path') ?? ''}`;

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
                item.description = renderDescription({
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
