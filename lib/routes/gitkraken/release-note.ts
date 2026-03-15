import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/release-note',
    categories: ['program-update'],
    example: '/gitkraken/release-note',
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
            source: ['help.gitkraken.com/gitkraken-desktop/current/'],
        },
        {
            source: ['www.gitkraken.com/'],
        },
    ],
    name: 'Release Notes',
    maintainers: ['TonyRL'],
    url: 'help.gitkraken.com/gitkraken-desktop/current/',
    handler,
};

async function handler() {
    const baseUrl = 'https://help.gitkraken.com';
    const link = `${baseUrl}/gitkraken-desktop/current/`;
    const response = await ofetch(`${baseUrl}/wp-json/wp/v2/posts/1964`);

    const $ = load(response.content.rendered, null, false);

    const items = $('h2')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                description: $item
                    .next()
                    .nextUntil('hr')
                    .toArray()
                    .map((el) => $.html(el))
                    .join(''),
                link: `${link}#${$item.prev().find('a[id]').attr('id')}`,
                pubDate: parseDate($item.next().find('kbd').text()?.split('day, ')[1].trim(), 'MMMM Do, YYYY', 'en'),
            };
        });

    return {
        title: response.title.rendered,
        description: sanitizeHtml(response.excerpt.rendered, { allowedTags: [], allowedAttributes: {} }),
        link,
        item: items,
    };
}
