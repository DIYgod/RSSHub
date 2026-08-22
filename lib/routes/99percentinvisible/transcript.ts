import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/transcript',
    categories: ['multimedia'],
    example: '/99percentinvisible/transcript',
    name: 'Transcript',
    maintainers: ['Ji4n1ng'],
    handler,
};

const host = 'https://99percentinvisible.org/';

async function handler() {
    const link = new URL('archives/', host).href;
    const response = await ofetch(link);

    const $ = load(response);

    const episodePrefix = new URL('episode/', host).href;
    const list = $('.content .post-blocks a.post-image')
        .toArray()
        .map((e) => `${$(e).attr('href')}transcript/`)
        .filter((e) => e.startsWith(episodePrefix));

    const items = await Promise.all(
        list.map((itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const response = await ofetch(itemUrl);
                const $ = load(response);

                return {
                    title: $('article header h1').text(),
                    link: itemUrl,
                    author: '99% Invisible',
                    description: $('article .page-content').html(),
                    pubDate: parseDate($('article header .entry-meta time').attr('datetime')!),
                };
            })
        )
    );

    return {
        title: '99% Invisible Transcript',
        link,
        item: items,
    };
}
