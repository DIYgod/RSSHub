import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type',
    categories: ['blog'],
    example: '/logrocket/dev',
    parameters: { type: 'dev | product-management | ux-design' },
    radar: [
        {
            source: ['blog.logrocket.com'],
            target: '/dev',
        },
        {
            source: ['blog.logrocket.com/dev'],
            target: '/dev',
        },
        {
            source: ['blog.logrocket.com/product-management'],
            target: '/product-management',
        },
        {
            source: ['blog.logrocket.com/ux-design'],
            target: '/ux-design',
        },
    ],
    name: 'Blog',
    maintainers: ['findwei'],
    handler,
    url: 'blog.logrocket.com/',
};
async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = 'https://blog.logrocket.com/';
    let title = 'Dev';
    if (type === 'product-management') {
        title = 'Product Management';
    } else if (type === 'ux-design') {
        title = 'UX Design';
    }
    const response = await ofetch(`${link}${type}`);
    const $ = load(response);
    const list = $('div.post-list .post-card')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a').first();
            const title = $item.find('.post-card-title');
            return {
                title: title.text(),
                link: a.attr('href'),
                pubDate: parseDate($item.find('.post-card-author-name').next().text().split(' ⋅ ', 1)[0], 'MMM D, YYYY'),
                author: $item.find('.post-card-author-name').text(),
            };
        });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet('logrocket:article:' + item.link, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const content = $('#the-content-container .lr-content');
                content.find('div.code-block').remove();
                return {
                    description: content.html(),
                    category: $('#post-tags a[rel="tag"]')
                        .toArray()
                        .map((tag) => $(tag).text()),
                };
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: `logrocket-${title}`,
        link,
        description: `logrocket-${title}`,
        item: items,
    };
}
