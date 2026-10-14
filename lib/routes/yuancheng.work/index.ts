import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:caty?',
    categories: ['other'],
    example: '/yuancheng.work/all',
    parameters: { caty: 'Job category, default to all' },
    radar: [
        {
            source: ['yuancheng.work/:caty'],
            target: (_, url) => (url ? `/yuancheng.work/${/(?:^|\/)remote-([a-z]+)-jobs(?:[/?#]|$)/.exec(url)?.[1] ?? 'all'}` : '/yuancheng.work'),
        },
    ],
    name: 'Remote.work Job Information',
    maintainers: ['luyuhuang'],
    description: `| All Jobs | Development | Design | Operation | Product | Function | Other | Marketing | Sales |
| :------: | :---------: | :----: | :-------: | :-----: | :------: | :---: | :-------: | :---: |
|    all   | development | design | operation | product | function | other | marketing | sales |`,
    handler,
};
const rootUrl = 'https://yuancheng.work/';
function parseGmtDate(value: string | undefined) {
    if (!value) {
        return;
    }
    const date = parseDate(value.replace(/(?:Z|\+00:00)$/, ''), ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS'], true);
    if (Number.isFinite(date.getTime())) {
        return timezone(date, 0);
    }
}
async function handler(ctx: Context) {
    const { caty = 'all' } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit') ?? 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.min(Math.floor(requestedLimit), 100) : 10;
    let category;
    if (caty !== 'all') {
        const slug = `remote-${caty}-jobs`;
        category = await cache.tryGet(`yuancheng.work:category:${slug}`, async () => {
            const res = await ofetch(`${rootUrl}wp-json/wp/v2/categories`, {
                query: { slug },
            });
            if (!res.length) {
                throw new Error('Bad category');
            }
            return res[0];
        });
    }
    const posts = await ofetch(`${rootUrl}wp-json/wp/v2/posts`, {
        query: {
            per_page: limit === 10 ? undefined : limit,
            categories: category?.id,
            _embed: '',
        },
    });
    const items = posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        guid: post.guid.rendered,
        description: post.content.rendered,
        pubDate: parseGmtDate(post.date_gmt),
        author: post._embedded.author.map((author) => author.name).join(', '),
        category: post._embedded['wp:term'].flat().map((term) => term.name),
    }));
    return {
        title: category ? `Remote Work-${caty.charAt(0).toUpperCase() + caty.slice(1)}|远程工作-${category.name}` : 'Remote Work|远程工作',
        link: category ? category.link : rootUrl,
        item: items,
    };
}
