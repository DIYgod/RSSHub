import { load } from 'cheerio';
import type { Context } from 'hono';
import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:uid',
    categories: ['reading'],
    example: '/uukanshu/18893',
    parameters: { uid: '小说 id, 可在对应小说页 URL 中找到' },
    name: '小说更新',
    maintainers: ['bott0n'],
    handler,
};

async function handler(ctx: Context) {
    const { uid } = ctx.req.param();

    const link = `https://uukanshu.cc/book/${uid}/`;
    const response = await ofetch(link, {
        headers: {
            'user-agent': config.trueUA,
        },
    });

    const $ = load(response);

    return {
        title: `UU看书 ${$('h1.booktitle').text()}`,
        link,
        description: sanitizeHtml($('.bookintro').text(), { allowedTags: [], allowedAttributes: {} }),
        image: $('.bookcover>img').attr('src'),
        item: $('.chapterlist dd a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.text(),
                    link: `https://uukanshu.cc${$item.attr('href')}`,
                };
            })
            .toReversed(),
    };
}
