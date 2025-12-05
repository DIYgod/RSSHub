import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

export const handler = async (ctx) => {
    const { category = 'latest/awarded' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://1x.com';
    const currentUrl = new URL(`gallery/${category}`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const language = $('html').prop('lang');
    const apiUrl = new URL(`backend/lm2.php?style=normal&mode=${$('input#lm_mode').prop('value')}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $$ = load(response);

    const items = $$('div.photos-feed-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('span.photos-feed-data-title').first().text() || 'Untitled';
            const image = item.find('img').prop('src');
            const author = item.find('span.photos-feed-data-name').first().text();

            const text = `${title} by ${author}`;

            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: text,
            });

            const id = item.find('img[id]').prop('id').split(/-/).pop();
            const guid = `1x-${id}`;

            return {
                title,
                description,
                link: new URL(`photo/${id}`, rootUrl).href,
                author,
                guid,
                id: guid,
                content: {
                    html: description,
                    text,
                },
                image,
                banner: image,
                language,
                enclosure_url: image,
                enclosure_type: image ? `image/${image.split(/\./).pop()}` : undefined,
                enclosure_title: title,
            };
        });

    const image = new URL($('img.themedlogo').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: 'Gallery',
    url: '1x.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/1x/latest/awarded',
    parameters: { category: 'Category, Latest Awarded by default' },
    description: `::: tip
Fill in the field in the path with the part of the corresponding page URL after \`https://1x.com/gallery/\` or \`https://1x.com/photo/\`. Here are the examples:

If you subscribe to [Abstract Awarded](https://1x.com/gallery/abstract/awarded), you should fill in the path with the part \`abstract/awarded\` from the page URL \`https://1x.com/gallery/abstract/awarded\`. In this case, the route will be [\`/1x/abstract/awarded\`](https://rsshub.app/1x/abstract/awarded).

If you subscribe to [Wildlife Published](https://1x.com/gallery/wildlife/published), you should fill in the path with the part \`wildlife/published\` from the page URL \`https://1x.com/gallery/wildlife/published\`. In this case, the route will be [\`/1x/wildlife/published\`](https://rsshub.app/1x/wildlife/published).
:::`,
    categories: ['design', 'picture'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['/gallery/:category*', '/photos/:category*'],
            target: '/1x/:category',
        },
    ],
};
