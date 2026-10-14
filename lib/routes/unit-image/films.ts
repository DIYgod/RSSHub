import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { renderYoutube } from '@/routes/youtube/utils';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        {
            source: ['www.unit-image.fr/category/:type'],
            target: '/films/:type',
        },
    ],
    name: 'Films',
    maintainers: ['MisteryMonster'],
    handler,
    url: 'www.unit-image.fr/films',
};
interface Project {
    link: string;
    title: { rendered: string };
    date_gmt?: string;
    _embedded: { 'wp:term': Array<Array<{ name: string }>> };
}

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const baseUrl = 'https://www.unit-image.fr';
    const apiUrl = `${baseUrl}/wp-json/wp/v2`;
    const requestedLimit = Math.trunc(Number(ctx.req.query('limit')));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10;
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
    const posts = await ofetch<Project[]>(`${apiUrl}/project`, {
        query: {
            per_page: limit === 10 ? undefined : limit,
            _embed: '',
            categories: category?.id,
        },
    });
    const items = await pMap(
        posts,
        async (post) => {
            const details = await cache.tryGet<Pick<DataItem, 'description'>>(`unit-image:film:detail:${post.link}`, async () => {
                const response = await ofetch(post.link);
                const $ = load(response);
                const content = $('main');
                content.find('script, style, noscript, input, .post_title').remove();
                content.find('.youtube-player').each((_, el) => {
                    $(el).replaceWith(renderYoutube(true, $(el).attr('data-id'), undefined, undefined));
                });
                content.find('.comparison-img').each((_, el) => {
                    const image = $(el)
                        .attr('style')
                        ?.match(/url\('(.+?)'\)/)?.[1];
                    $(el).replaceWith(image ? `<img src="${image}">` : '');
                });
                return { description: content.html() };
            });
            return {
                title: post.title.rendered,
                link: post.link,
                pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
                category: post._embedded['wp:term'].flat().map((term) => term.name),
                ...details,
            };
        },
        { concurrency: 3 }
    );
    return {
        title: `Unit Image Films${type ? ` - ${type}` : ''}`,
        link: category ? category.link : `${baseUrl}/films/`,
        description: 'Unit Images Films',
        item: items,
    };
}
