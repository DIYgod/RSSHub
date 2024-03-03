// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { userUrl, appsUrl } = require('../utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { uid, lang = '' } = ctx.req.param();
    const link = `${userUrl}${lang ? `/${lang}` : ''}/${uid}`;

    const { data: response } = await got(link);
    const { data } = await got(`${userUrl}/getUserAppCommentList`, {
        searchParams: {
            fid: uid,
        },
    });

    const $ = load(response);
    const username = $('.person .name').text();

    const items = data.list.map((item) => ({
        title: `${username} ▶ ${item.app.name}`,
        link: `${appsUrl}/comment-detail/${item.comment.id}`,
        description: art(path.join(__dirname, '../templates/comment.art'), {
            rating: item.score,
            text: item.comment.content,
        }),
        pubDate: timezone(parseDate(item.comment.created_at, 'YYYY-MM-DD'), 8),
        author: username,
    }));

    ctx.set('data', {
        title: $('head title').text(),
        link,
        image: decodeURIComponent($('.person div.slot').attr('data-args')).replace('avatar=', '').split('?')[0],
        language: $('html').attr('lang'),
        item: items,
    });
};
