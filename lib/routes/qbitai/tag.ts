import type { Route } from '@/types';
import parser from '@/utils/rss-parser';

import { getItems } from './category';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['new-media'],
    example: '/qbitai/tag/大语言模型',
    parameters: { tag: '标签名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['qbitai.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['FuryMartin'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const link = encodeURI(`https://www.qbitai.com/tag/${tag}/feed`);
    const feed = await parser.parseURL(link);

    return {
        title: `量子位-${tag}`,
        link: `https://www.qbitai.com/tag/${tag}`,
        item: await getItems(feed),
    };
}
