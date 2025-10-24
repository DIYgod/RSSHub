import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { baseUrl, processWork, processCreator } from './utils';
import { config } from '@/config';

const categoryMap = {
    // Works categories
    new_art_works: '新着作品 (Illust)',
    new_voice_works: '新着作品 (Voice)',
    new_novel_works: '新着作品 (Novel)',
    new_video_works: '新着作品 (Video)',
    new_music_works: '新着作品 (Music)',
    new_correction_works: '新着作品 (Advice)',
    new_comic_works: '新着作品 (Comic)',
    popular_works: '人気の作品 (Popular)',
    // Creators categories
    popular_creators: '人気クリエイター',
    new_creators: '新着クリエイター',
};

const workCategories = new Set(['new_art_works', 'new_voice_works', 'new_novel_works', 'new_video_works', 'new_music_works', 'new_correction_works', 'new_comic_works', 'popular_works']);

export const route: Route = {
    path: '/:category',
    categories: ['picture'],
    example: '/skeb/new_art_works',
    parameters: { category: 'Category, the div id of the section title on the homepage.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Skeb',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: '新着作品 (Illust)',
            source: ['skeb.jp'],
            target: '/new_art_works',
        },
        {
            title: '新着作品 (Voice)',
            source: ['skeb.jp'],
            target: '/new_voice_works',
        },
        {
            title: '新着作品 (Novel)',
            source: ['skeb.jp'],
            target: '/new_novel_works',
        },
        {
            title: '新着作品 (Video)',
            source: ['skeb.jp'],
            target: '/new_video_works',
        },
        {
            title: '新着作品 (Music)',
            source: ['skeb.jp'],
            target: '/new_music_works',
        },
        {
            title: '新着作品 (Advice)',
            source: ['skeb.jp'],
            target: '/new_correction_works',
        },
        {
            title: '新着作品 (Comic)',
            source: ['skeb.jp'],
            target: '/new_comic_works',
        },
        {
            title: '人気の作品 (Popular)',
            source: ['skeb.jp'],
            target: '/popular_works',
        },
        {
            title: '人気クリエイター',
            source: ['skeb.jp'],
            target: '/popular_creators',
        },
        {
            title: '新着クリエイター',
            source: ['skeb.jp'],
            target: '/new_creators',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') || 'new_art_works';

    if (!(category in categoryMap)) {
        throw new Error('Invalid category');
    }

    const url = `${baseUrl}/api`;

    const apiData = await cache.tryGet(
        url,
        async () => {
            const data = await ofetch(url);
            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (!apiData || typeof apiData !== 'object') {
        throw new Error('Invalid data received from API');
    }

    const items = await cache.tryGet(category, async () => {
        if (!(category in apiData) || !Array.isArray(apiData[category])) {
            return [];
        }

        const processItem = workCategories.has(category) ? processWork : processCreator;
        return (await Promise.all(apiData[category].map(async (item) => await processItem(item)).filter(Boolean))) as DataItem[];
    });

    return {
        title: `Skeb - ${categoryMap[category]}`,
        link: `${baseUrl}/#${category}`,
        item: items as DataItem[],
    };
}
