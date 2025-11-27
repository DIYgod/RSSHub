import type { Data, Route } from '@/types';
import parser from '@/utils/rss-parser';

import { getBySlug, getPostsBy, processItems } from './utils';

export const route: Route = {
    path: '/:keyword',
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
        nsfw: true,
    },
    name: 'Navigation',
    maintainers: ['SnowAgar25'],
    handler,
    description: `| 殿堂 | 動畫 | VR | 漫畫 | 音聲 | CG・イラスト |
| ---- | ----- | -- | ----- | ----- | -- |
| best | video | vr | comic | voice | cg |`,
};

const navigationItems = {
    video: { url: '/nipple-video', title: '動畫' },
    vr: { url: '/nipple-video-category/cat-nipple-video-vr', title: 'VR' },
    comic: { url: '/comic', title: '漫畫' },
    voice: { url: '/voice', title: '音聲' },
    cg: { url: '/cg', title: 'CG' },
};

async function handler(ctx): Promise<Data> {
    const keyword = ctx.req.param('keyword') ?? '';
    const baseUrl = 'https://chikubi.jp';

    if (keyword === 'best') {
        const { id } = await getBySlug('category', 'nipple-best');
        const items = await getPostsBy('category', id);

        return {
            title: '殿堂 - chikubi.jp',
            link: `${baseUrl}/best-nipple-article`,
            item: items,
        };
    } else {
        const { url, title } = navigationItems[keyword];

        const feed = await parser.parseURL(`${baseUrl}${url}/feed`);

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
}
