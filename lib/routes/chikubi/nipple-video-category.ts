import { Route, Data } from '@/types';
import { processItems } from './utils';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/nipple-video-category/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/nipple-video-category/cat-nipple-video-god',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '動画カテゴリー',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: '動画カテゴリー',
            source: ['chikubi.jp/nipple-video-category/:keyword'],
            target: '/nipple-video-category/:keyword',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const { keyword } = ctx.req.param();
    const baseUrl = 'https://chikubi.jp';
    const url = `/nipple-video-category/${encodeURIComponent(keyword)}`;

    const feed = await parser.parseURL(`${baseUrl}${url}/feed`);

    const list = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
    }));

    const items = await processItems(list);

    return {
        title: `動画カテゴリー: ${feed.title?.split('-')[0]} - chikubi.jp`,
        link: `${baseUrl}${url}`,
        item: items,
    };
}
