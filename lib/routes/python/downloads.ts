import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:pre?',
    categories: ['program-update'],
    example: '/python',
    parameters: { pre: '填入 `pre` 以包含预发布版本，默认只含正式版本' },
    name: '版本发布',
    maintainers: ['trim21'],
    handler,
};

async function handler(ctx: Context) {
    const { pre: includePreRelease } = ctx.req.param();

    const response = await ofetch('https://www.python.org/downloads');
    const $ = load(response);

    return {
        title: 'cpython',
        link: 'https://www.python.org/',
        item: $('.list-row-container.menu li')
            .toArray()
            .map((el) => {
                const $item = $(el);
                const title = $item.find('span.release-number').text();
                return {
                    title,
                    description: title,
                    link: $item.find('.release-enhancements a').attr('href'),
                    pubDate: parseDate($item.find('.release-date').text()),
                };
            })
            .filter(({ title }) => title && (includePreRelease || !title.includes('rc'))),
    };
}
