import type { Data, Route } from '@/types';

import { getPosts } from './utils';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/chikubi',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '最新記事',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: '最新記事',
            source: ['chikubi.jp/'],
            target: '/',
        },
        {
            title: '殿堂',
            source: ['chikubi.jp/best-nipple-article'],
            target: '/best',
        },
        {
            title: '動畫',
            source: ['chikubi.jp/nipple-video'],
            target: '/video',
        },
        {
            title: 'VR',
            source: ['chikubi.jp/nipple-video-category/cat-nipple-video-vr'],
            target: '/vr',
        },
        {
            title: '漫畫',
            source: ['chikubi.jp/comic'],
            target: '/comic',
        },
        {
            title: '音聲',
            source: ['chikubi.jp/voice'],
            target: '/voice',
        },
        {
            title: 'CG・イラスト',
            source: ['chikubi.jp/cg'],
            target: '/cg',
        },
    ],
};

async function handler(): Promise<Data> {
    const items = await getPosts();

    return {
        title: '最新記事 - chikubi.jp',
        link: 'https://chikubi.jp',
        item: items,
    };
}
