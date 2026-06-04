import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { viewForum, viewThread } from './query';
import { renderContent } from './templates/content';

export const route: Route = {
    path: '/forum/:id?/:digest?',
    radar: [
        {
            source: ['lkong.com/forum/:id', 'lkong.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk', 'ma6254'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '8';
    const digest = ctx.req.param('digest');

    const rootUrl = 'https://www.lkong.com';
    const apiUrl = 'https://api.lkong.com/api';
    const currentUrl = `${rootUrl}/forum/${id}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: viewForum(id),
    });

    let items = response.data.data[digest ? 'hots' : 'threads'].map((item) => ({
        guid: item.tid,
        title: item.title,
        link: `${rootUrl}/thread/${item.tid}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: apiUrl,
                    json: viewThread(item.guid, 1),
                });

                item.author = detailResponse.data.data.thread?.author.name;
                item.pubDate = parseDate(detailResponse.data.data.thread?.dateline);
                item.description = renderContent(JSON.parse(detailResponse.data.data.posts[0].content));
                delete item.guid;

                return item;
            })
        )
    );

    return {
        title: `${response.data.data.forum.name} - 龙空`,
        link: currentUrl,
        item: items,
        description: response.data.data.forumCount.info,
    };
}
