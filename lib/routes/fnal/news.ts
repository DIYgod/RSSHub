import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/fnal/news',
    parameters: {
        category: 'Category, see below, All News by default',
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `| All News | Fermilab features | Press releases | Symmetry features |
| -------- | ----------------- | -------------- | ----------------- |
| allnews  | 269               | 55             | 12580             |`,
};

async function handler(ctx: Context) {
    const { category = 'allnews' } = ctx.req.param();

    const rootUrl = 'https://news.fnal.gov';
    const posts = await ofetch(`${rootUrl}/wp-json/wp/v2/posts`, {
        query: {
            _embed: '',
            ...(category !== 'allnews' && { categories: category }),
        },
    });

    const items = posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        description: post.content.rendered,
        pubDate: parseDate(`${post.date_gmt}Z`),
        author: post._embedded?.author?.[0]?.name,
        category: [
            ...new Set(
                post._embedded['wp:term']
                    .flat()
                    .filter((term) => term.taxonomy === 'category' || term.taxonomy === 'post_tag')
                    .map((term) => term.name)
            ),
        ],
    }));

    return {
        title: 'Fermilab News',
        link: `${rootUrl}/newsroom/news/?se=&c=${category}`,
        item: items,
    };
}
