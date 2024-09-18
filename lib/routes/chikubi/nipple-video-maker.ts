import { Route, Data } from '@/types';
import { processItems } from './utils';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/nipple-video-maker/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/nipple-video-maker/nipple-video-maker-nh',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'AVメーカー',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'AVメーカー',
            source: ['chikubi.jp/nipple-video-maker/:keyword'],
            target: '/nipple-video-maker/:keyword',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const { keyword } = ctx.req.param();
    const baseUrl = 'https://chikubi.jp';
    const url = `/nipple-video-maker/${encodeURIComponent(keyword)}`;

    const feed = await parser.parseURL(`${baseUrl}${url}/feed`);

    const list = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
    }));

    const items = await processItems(list);

    return {
        title: `AVメーカー: ${feed.title?.split('-')[0]} - chikubi.jp`,
        link: `${baseUrl}${url}`,
        item: items,
    };
}
