import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { parseContent } from './utils';

const base = 'https://piapro.jp';

export const route: Route = {
    path: '/user/:pid',
    categories: ['social-media'],
    example: '/piapro/user/shine_longer',
    parameters: { pid: 'User ID, can be found in url' },
    name: 'User latest works',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { pid } = ctx.req.param();

    const url = `${base}/${pid}/content_list/all/1`;

    const listResponse = await ofetch(url);
    const $ = load(listResponse);

    const username = $('.page_back_txt').text();

    const list = $('.tmblist_list li > a')
        .toArray()
        .map((item) => base + $(item).attr('href'));

    const items = await pMap(
        list.slice(0, 10),
        (link) =>
            cache.tryGet(link, async () => {
                const response = await ofetch(link);
                return {
                    ...parseContent(response),
                    link,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `piapro - ${username}の投稿作品`,
        link: url,
        item: items,
        language: 'ja',
    };
}
