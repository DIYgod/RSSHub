import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/discussion/:id',
    categories: ['bbs'],
    example: '/lowendtalk/discussion/168480',
    parameters: {
        id: 'Discussion id, can be found in the URL',
    },
    radar: [
        {
            source: ['lowendtalk.com/discussion/:id/*', 'lowendtalk.com/discussion/:id'],
        },
    ],
    name: 'Discussion',
    maintainers: ['nczitzk'],
    handler,
    url: 'lowendtalk.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://lowendtalk.com';
    const link = `${baseUrl}/discussion/${id}`;

    const firstPage = await ofetch(link);
    let $ = load(firstPage);
    const lastPage = $('.LastPage').attr('href');
    if (lastPage) {
        const response = await ofetch(lastPage);
        $ = load(response);
    }

    const items = $('.ItemDiscussion, .ItemComment')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const author = $item.find('.Username').text();
            return {
                title: $item.find('.Message').text(),
                description: $item.find('.Message').html(),
                author,
                link: new URL($item.find('.DateCreated a').attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.DateCreated time').attr('datetime')!), 0),
            };
        });

    return {
        title: $('h1').text(),
        link,
        item: items,
    };
}
