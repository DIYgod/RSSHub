import { Route } from '@/types';
import { namespace } from './namespace';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import type { Context } from 'hono';

const baseUrl = `https://${namespace.url}`;

export const route: Route = {
    path: '/:username/watchlist',
    categories: ['social-media'],
    example: '/letterboxd/matthew/watchlist',
    parameters: {
        username: 'Letterboxd username',
    },
    radar: [
        {
            source: ['letterboxd.com/:username/watchlist/'],
        },
    ],
    name: 'User Watchlist',
    maintainers: ['johan456789'],
    handler,
    url: 'letterboxd.com',
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const currentUrl = `${baseUrl}/${username}/watchlist/`;

    const html = await ofetch(currentUrl);
    const $ = load(html);

    const wrappers = $('div.react-component[data-component-class*="LazyPoster"]').toArray();

    const items = await Promise.all(
        wrappers.map(async (el) => {
            const wrapper = $(el);
            const linkPath = wrapper.attr('data-item-link') || wrapper.attr('data-target-link') || '';
            const link = linkPath ? new URL(linkPath, baseUrl).href : undefined;
            const title = (wrapper.attr('data-item-full-display-name') || wrapper.attr('data-item-name') || '') as string;
            let image: string | undefined;
            if (link) {
                const posterApiUrl = `${link}poster/std/125/`;
                const cacheKey = `letterboxd:poster:${posterApiUrl}`;
                const posterData = await cache.tryGet<Record<string, any>>(cacheKey, () => ofetch(posterApiUrl, { responseType: 'json' }));
                image = posterData.url2x || posterData.url;
            }

            return {
                title,
                link,
                image,
            };
        })
    );

    return {
        title: $('title').text().trim().replaceAll('\u200E', '') || `${username}'s Watchlist • Letterboxd`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
