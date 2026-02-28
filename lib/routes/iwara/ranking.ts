import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

const rootUrl = 'https://www.iwara.tv';
const apiRootUrl = 'https://apiq.iwara.tv';
const imageRootUrl = 'https://i.iwara.tv';

const typeMap = {
    video: 'Videos',
    image: 'Images',
};

const sortMap = {
    date: 'Latest',
    trending: 'Trending',
    popularity: 'Popularity',
    views: 'Views',
    likes: 'Likes',
};

const ratingMap = {
    all: 'All',
    general: 'General',
    ecchi: 'Ecchi',
};

const parseThumbnail = (type, item) => {
    if (type === 'image') {
        return item.thumbnail ? `<img src="${imageRootUrl}/image/original/${item.thumbnail.id}/${item.thumbnail.name}">` : '';
    }

    if (item.embedUrl === null) {
        return item.file ? `<img src="${imageRootUrl}/image/original/${item.file.id}/thumbnail-${String(item.thumbnail).padStart(2, '0')}.jpg">` : '';
    }

    // regex borrowed from https://stackoverflow.com/a/3726073
    const match = /https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]*)(&(amp;)?[\w=?]*)?/.exec(item.embedUrl);
    if (match) {
        return `<img src="${imageRootUrl}/image/embed/original/youtube/${match[1]}">`;
    }

    return '';
};

export const route: Route = {
    path: '/ranking/:type?/:sort?/:rating?',
    example: '/iwara/ranking/video/date/ecchi',
    parameters: {
        type: 'Content type, can be video or image, default is video',
        sort: 'Sort type, can be date, trending, popularity, views, likes, default is date',
        rating: 'Rating, can be all, general, ecchi, default is ecchi',
    },
    name: 'Ranking',
    maintainers: ['CaoMeiYouRen233'],
    handler,
    features: {
        requirePuppeteer: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.iwara.tv/videos', 'www.iwara.tv/images'],
            target: (params, url) => {
                const searchParams = new URL(url).searchParams;
                const type = url.includes('/videos') ? 'video' : 'image';
                const sort = searchParams.get('sort') || 'date';
                const rating = searchParams.get('rating') || 'ecchi';
                return `/iwara/ranking/${type}/${sort}/${rating}`;
            },
        },
    ],
};

async function handler(ctx) {
    const { type = 'video', sort = 'date', rating = 'ecchi' } = ctx.req.param();

    const limit = ctx.req.query('limit') || 32;
    const url = `${apiRootUrl}/${type === 'video' ? 'videos' : 'images'}?sort=${sort}&rating=${rating}&limit=${limit}`;

    const items = await cache.tryGet(
        `iwara:ranking:${type}:${sort}:${rating}`,
        async () => {
            const { page, destory } = await getPuppeteerPage(url, {
                onBeforeLoad: async (page) => {
                    await page.setRequestInterception(true);
                    page.on('request', (request) => {
                        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' || request.resourceType() === 'fetch' ? request.continue() : request.abort();
                    });
                },
                gotoConfig: {
                    waitUntil: 'networkidle0',
                },
            });

            try {
                const content = await page.evaluate(() => document.querySelector('pre')?.textContent || document.body.textContent);
                const response = JSON.parse(content || '{}');

                return response.results.map((item) => ({
                    title: item.title,
                    author: item.user.name,
                    link: `${rootUrl}/${type === 'video' ? 'video' : 'image'}/${item.id}/${item.slug || ''}`,
                    category: item.tags?.map((i) => i.id) || [],
                    description: parseThumbnail(type, item),
                    pubDate: parseDate(item.createdAt),
                }));
            } finally {
                await destory();
            }
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `Iwara Ranking - ${typeMap[type]} - ${sortMap[sort]} - ${ratingMap[rating]}`,
        link: `${rootUrl}/${type === 'video' ? 'videos' : 'images'}?sort=${sort}&rating=${rating}`,
        item: items,
    };
}
