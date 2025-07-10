import { Route } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

import { viewThread, countReplies } from './query';

export const route: Route = {
    path: '/thread/:id',
    radar: [
        {
            source: ['lkong.com/thread/:id', 'lkong.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk', 'ma6254'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: `${response.data.data.thread.title} - 龙空`,
        link: currentUrl,
        item: items,
    };
}
