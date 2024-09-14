import { Route, Data } from '@/types';
import { processItems } from './utils';
import Parser from 'rss-parser';

export const route: Route = {
    path: '/:keyword?',
    categories: ['multimedia'],
    example: '/chikubi',
    parameters: { keyword: '導覽列，見下表，默認爲最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Navigation',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'ホーム',
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
    description: `| 最新 | 殿堂 | 動畫 | VR | 漫畫 | 音聲 | CG |
    | ------ | ---- | ----- | -- | ----- | ----- | -- |
    | (empty) | best | video | vr | comic | voice | cg |`,
};

const navigationItems = {
    '': { url: '', title: '最新' },
    best: { url: '/category/nipple-best', title: '殿堂' },
    video: { url: '/nipple-video', title: '動畫' },
    vr: { url: '/nipple-video-category/cat-nipple-video-vr', title: 'VR' },
    comic: { url: '/comic', title: '漫畫' },
    voice: { url: '/voice', title: '音聲' },
    cg: { url: '/cg', title: 'CG' },
};

async function handler(ctx): Promise<Data> {
    const keyword = ctx.req.param('keyword') ?? '';
    const baseUrl = 'https://chikubi.jp';

    const { url, title } = navigationItems[keyword];

    const feed = await new Parser().parseURL(`${baseUrl}${url}/feed`);

    const list = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
    }));

    // 獲取內文
    const items = await processItems(list);

    return {
        title: `${title} - chikubi.jp`,
        link: `${baseUrl}${url}`,
        item: items,
    };
}
