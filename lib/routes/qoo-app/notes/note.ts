// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { ssoUrl, notesUrl } = require('../utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const api = `${ssoUrl}/api/v1/comments`;
    const link = `${notesUrl}/note/${id}`;

    const { data: response } = await got(link);
    const $ = load(response);

    const { data } = await got(api, {
        searchParams: {
            sort: 'newest',
            for: 'web',
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
            type: 'note',
            object_id: id,
        },
    });

    const items = data.data.map((item) => ({
        title: item.content,
        description: art(path.join(__dirname, '../templates/note.art'), {
            content: item.content,
            picture: item.picture,
        }),
        pubDate: parseDate(item.created_timestamp),
        author: item.user.name,
        guid: `qoo-app:notes:note:${id}:${item.id}`,
    }));

    ctx.set('data', {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    });
};
