// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const { viewThread, countReplies } = require('./query');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.lkong.com';
    const apiUrl = 'https://api.lkong.com/api';
    const currentUrl = `${rootUrl}/thread/${id}`;

    const countResponse = await got({
        method: 'post',
        url: apiUrl,
        json: countReplies(id),
    });

    if (countResponse.data.errors) {
        throw new Error(countResponse.data.errors[0].message);
    }

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: viewThread(id, Math.ceil(countResponse.data.data.thread.replies / 20)),
    });

    const items = response.data.data.posts.map((item) => ({
        guid: item.pid,
        author: item.user.name,
        title: `#${item.lou} ${item.user.name}`,
        link: `${rootUrl}/thread/${id}?pid=${item.pid}`,
        pubDate: parseDate(item.dateline),
        description:
            (item.quote
                ? art(path.join(__dirname, 'templates/quote.art'), {
                      target: `${rootUrl}/thread/${id}?pid=${item.quote.pid}`,
                      author: item.quote.author.name,
                      content: art(path.join(__dirname, 'templates/content.art'), {
                          content: JSON.parse(item.quote.content),
                      }),
                  })
                : '') +
            art(path.join(__dirname, 'templates/content.art'), {
                content: JSON.parse(item.content),
            }),
    }));

    ctx.set('data', {
        title: `${response.data.data.thread.title} - 龙空`,
        link: currentUrl,
        item: items,
    });
};
