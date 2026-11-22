import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderNote } from '../templates/note';
import { notesUrl, ssoUrl } from '../utils';

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
        requirePuppeteer: false,
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
    const { id, lang = '' } = ctx.req.param();
    const api = `${ssoUrl}/api/v1/comments`;
    const link = `${notesUrl}${lang ? `/${lang}` : ''}/note/${id}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const { data } = await got(api, {
        searchParams: {
            sort: 'newest',
            for: 'web',
            limit: getRouteLimit(ctx, 100),
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
}
