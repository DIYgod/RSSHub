import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { baseUrl, processWork, processCreator } from './utils';

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
    request_masters: 'リクエストマスター',
    first_requesters: 'ファーストリクエスター',
};

const workCategories = new Set(['new_art_works', 'new_voice_works', 'new_novel_works', 'new_video_works', 'new_music_works', 'new_correction_works', 'new_comic_works', 'popular_works']);

export const route: Route = {
    path: '/:category',
    categories: ['picture'],
    example: '/new_art_works',
    parameters: { category: '見下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Skeb',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: '新着作品 (Illust)',
            source: ['skeb.jp/#new_art_works'],
            target: '/new_art_works',
        },
        {
            title: '新着作品 (Voice)',
            source: ['skeb.jp/#new_voice_works'],
            target: '/new_voice_works',
        },
        {
            title: '新着作品 (Novel)',
            source: ['skeb.jp/#new_novel_works'],
            target: '/new_novel_works',
        },
        {
            title: '新着作品 (Video)',
            source: ['skeb.jp/#new_video_works'],
            target: '/new_video_works',
        },
        {
            title: '新着作品 (Music)',
            source: ['skeb.jp/#new_music_works'],
            target: '/new_music_works',
        },
        {
            title: '新着作品 (Advice)',
            source: ['skeb.jp/#new_correction_works'],
            target: '/new_correction_works',
        },
        {
            title: '新着作品 (Music)',
            source: ['skeb.jp/#new_comic_works'],
            target: '/new_comic_works',
        },
        {
            title: '人気の作品 (Popular)',
            source: ['skeb.jp/#popular_works'],
            target: '/popular_works',
        },
        {
            title: '人気クリエイター',
            source: ['skeb.jp/#popular_creators'],
            target: '/popular_creators',
        },
        {
            title: '新着クリエイター',
            source: ['skeb.jp/#new_creators'],
            target: '/new_creators',
        },
        {
            title: 'リクエストマスター',
            source: ['skeb.jp/#request_masters'],
            target: '/request_masters',
        },
        {
            title: 'ファーストリクエスター',
            source: ['skeb.jp/#first_requesters'],
            target: '/first_requesters',
        },
    ],
    description: `
  | Illust | Voice | Novel | Video | Music | Advice | Comic | 人気の作品 | 人気クリエイター | 新着クリエイター | リクエストマスター | ファーストリクエスター |
  | -------- | ------ | -------- | -------- | ---------- | ---------- | -------- | ---------- | ---------------- | ---------------- | -------------------- | ------------------------ |
  | new_art_works | new_voice_works | new_novel_works | new_video_works | new_music_works | new_correction_works | new_comic_works | popular_works | popular_creators | new_creators | request_masters | first_requesters |`,
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') || 'new_art_works';

    if (!(category in categoryMap)) {
        throw new Error('Invalid category');
    }

    const url = `${baseUrl}/api`;

    const items = await cache.tryGet(category, async () => {
        const data = await ofetch(url, { parseResponse: JSON.parse });

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data received from API');
        }

        const items: DataItem[] = [];
        if (category in data && Array.isArray(data[category])) {
            const processItem = workCategories.has(category) ? processWork : processCreator;
            items.push(...(data[category].map((item) => processItem(item)).filter(Boolean) as DataItem[]));
        }

        return items;
    });

    return {
        title: `Skeb - ${categoryMap[category]}`,
        link: `${baseUrl}/#${category}`,
        item: items as DataItem[],
    };
}
