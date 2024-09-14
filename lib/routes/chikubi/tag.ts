import { Route, Data } from '@/types';
import { processItems } from './utils';
import Parser from 'rss-parser';

export const route: Route = {
    path: '/tag/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/tag/ドリームチケット',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tag',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Tag',
            source: ['chikubi.jp/tag/:keyword'],
            target: '/tag/:keyword',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const { keyword } = ctx.req.param();
    const baseUrl = 'https://chikubi.jp';
    const url = `/tag/${encodeURIComponent(keyword)}`;

    const feed = await new Parser().parseURL(`${baseUrl}${url}/feed`);

    const list = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
    }));

    const items = await processItems(list);

    return {
        title: `Tag: ${feed.title?.split('-')[0]} - chikubi.jp`,
        link: `${baseUrl}${url}`,
        item: items,
    };
}
