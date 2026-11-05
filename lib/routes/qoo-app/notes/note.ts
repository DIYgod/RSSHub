import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderNote } from '../templates/note';
import { createPageFetcher, notesUrl, ssoUrl } from '../utils';

export const route: Route = {
    path: ['/notes/:lang/note/:id', '/notes/note/:id'],
    categories: ['anime'],
    example: '/qoo-app/notes/en/note/2329113',
    parameters: {
        lang: 'Language, see the table above, empty means `中文`',
        id: 'Note ID, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Note Comments',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const pageFetcher = createPageFetcher();
    try {
        const { id, lang = '' } = ctx.req.param();
        const requestedLimit = Number(ctx.req.query('limit'));
        const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 100;
        const api = `${ssoUrl}/api/v1/comments`;
        const link = `${notesUrl}${lang ? `/${lang}` : ''}/note/${id}`;

        const response = await pageFetcher.get(link);
        const $ = load(response);

        const { data } = await got(api, {
            searchParams: {
                sort: 'newest',
                for: 'web',
                limit,
                type: 'note',
                object_id: id,
            },
        });

        const items = data.data.map((item) => ({
            title: item.content,
            description: renderNote({
                content: item.content,
                picture: item.picture,
            }),
            pubDate: parseDate(item.created_timestamp, 'X'),
            author: item.user.name,
            guid: `qoo-app:notes:note:${id}:${item.id}`,
        }));

        return {
            title: $('head title').text(),
            link,
            language: $('html').attr('lang') as Language,
            item: items,
        };
    } finally {
        await pageFetcher.close();
    }
}
