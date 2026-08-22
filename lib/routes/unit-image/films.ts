import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { renderYoutube } from '@/routes/youtube/utils';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/films/:type?',
    categories: ['design'],
    example: '/unit-image/films/vfx',
    parameters: {
        type: {
            description: 'Films type',
            options: ['vfx', 'game-trailer', 'commercials', 'making-of', 'events'].map((value) => ({ value, label: value })),
        },
    },
    radar: [
        {
            source: ['www.unit-image.fr/films'],
            target: '/films',
        },
    ],
    name: 'Films',
    maintainers: ['MisteryMonster'],
    handler,
    url: 'www.unit-image.fr/films',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const baseUrl = 'https://www.unit-image.fr';
    const apiUrl = `${baseUrl}/wp-json/wp/v2`;
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 10;

    let category;
    if (type) {
        category = await cache.tryGet(`unit-image:category:${type}`, async () => {
            const categories = await ofetch(`${apiUrl}/categories`, { query: { slug: type } });
            if (categories.length === 0) {
                throw new InvalidParameterError(`Unknown type: ${type}`);
            }
            return categories[0];
        });
    }

    const posts = await ofetch(`${apiUrl}/project`, {
        query: {
            per_page: limit === 10 ? undefined : limit,
            _embed: '',
            categories: category?.id,
        },
    });

    const items = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link, async () => {
                const response = await ofetch(post.link);
                const $ = load(response);
                const content = $('main');
                content.find('style, noscript, input').remove();
                content.find('.youtube-player').each((_, el) => {
                    $(el).replaceWith(renderYoutube(true, $(el).attr('data-id'), undefined, undefined));
                });
                content.find('.comparison-img').each((_, el) => {
                    const image = $(el)
                        .attr('style')
                        ?.match(/url\('(.+?)'\)/)?.[1];
                    $(el).replaceWith(image ? `<img src="${image}">` : '');
                });

                return {
                    title: post.title.rendered,
                    link: post.link,
                    pubDate: timezone(parseDate(post.date_gmt), 0),
                    description: content.html(),
                    category: post._embedded['wp:term'].flat().map((term) => term.name),
                };
            })
        )
    );

    return {
        title: `Unit Image Films${type ? ` - ${type}` : ''}`,
        link: category ? category.link : `${baseUrl}/films/`,
        description: 'Unit Images Films',
        item: items,
    };
}
