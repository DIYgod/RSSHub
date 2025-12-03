import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/posts/:topic/:id',
    categories: ['game'],
    example: '/itch/posts/9539/introduce-yourself',
    parameters: { topic: 'Topic id, can be found in URL', id: 'Topic name, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['itch.io/t/:topic/:id'],
        },
    ],
    name: 'Posts',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic');
    const id = ctx.req.param('id');

    const rootUrl = 'https://itch.io';
    const currentUrl = `${rootUrl}/t/${topic}/${id}?before=999999999`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.post_grid')
        .toArray()
        .map((item) => {
            item = $(item);

            const author = item.find('.post_author').text();
            const description = item.find('.post_body');

            return {
                author,
                description: description.html(),
                title: `${author}: ${description.text()}`,
                link: item.find('.post_date a').attr('href'),
                pubDate: parseDate(item.find('.post_date').attr('title')),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
