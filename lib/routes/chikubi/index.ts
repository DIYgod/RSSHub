import { Route, Data } from '@/types';
import { processItems } from './utils';
import Parser from 'rss-parser';

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/chikubi',
    parameters: { category: '分類，見下表，默認爲最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['snowagar25'],
    handler,
    description: `| 最新 | 殿堂 | 動畫 | VR | 漫畫 | 音聲 | CG |
    | ------ | ---- | ----- | -- | ----- | ----- | -- |
    | (empty) | best | video | vr | comic | voice | cg |`,
    radar: [
        {
            source: ['chikubi.jp/:category', 'chikubi.jp/'],
            target: '/:category',
        },
    ],
};

const navPages = {
    '': { url: '', title: '最新' },
    best: { url: '/category/nipple-best', title: '殿堂' },
    video: { url: '/nipple-video', title: '動畫' },
    vr: { url: '/nipple-video-category/cat-nipple-video-vr', title: 'VR' },
    comic: { url: '/comic', title: '漫畫' },
    voice: { url: '/voice', title: '音聲' },
    cg: { url: '/cg', title: 'CG' },
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') ?? '';
    const baseUrl = 'https://chikubi.jp';

    const { url, title } = navPages[category];

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
