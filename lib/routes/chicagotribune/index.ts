import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category/:subcategory?',
    categories: ['traditional-media'],
    example: '/chicagotribune/news/nation',
    parameters: { category: 'Category', subcategory: 'Subcategory' },
    radar: [{ source: ['www.chicagotribune.com/:category/:subcategory?'] }],
    name: 'News',
    maintainers: ['oppilate'],
    description: `Generates full-text that the official feed doesn't provide. For instance, \`https://www.chicagotribune.com/news/national/\` corresponds to \`/chicagotribune/news/national\`.`,
    handler,
    url: 'www.chicagotribune.com',
};

async function handler(ctx: Context) {
    const { category, subcategory } = ctx.req.param();

    const baseUrl = 'https://www.chicagotribune.com';
    const link = `${baseUrl}/${category}/${subcategory ? `${subcategory}/` : ''}`;

    const response = await ofetch(link);
    const $ = load(response);

    const categoryId = $('body')
        .attr('class')
        ?.match(/\bcategory-(\d+)\b/)?.[1];
    if (!categoryId) {
        throw new Error(`Cannot find category id for ${link}`);
    }

    const posts = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
        query: { categories: categoryId, _embed: '' },
    });

    const items = posts.map((post) => ({
        title: post.title.rendered,
        description: post.content.rendered,
        link: post.link,
        guid: post.guid.rendered,
        pubDate: parseDate(post.date_gmt),
        author: post.authors?.map((author) => author.display_name).join(', '),
        category: post._embedded?.['wp:term']
            ?.flat()
            .filter((term) => term.taxonomy === 'category')
            .map((term) => term.name),
    }));

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        language: $('html').attr('lang') as Language,
        item: items,
    };
}
