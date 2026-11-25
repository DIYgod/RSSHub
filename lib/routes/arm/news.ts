import type { Context } from 'hono';

import type { Route } from '@/types';
import { ViewType } from '@/types';

import { fetchNewsroomData, TOPIC_TABLE_EN, TOPIC_TABLE_ZH } from './utils';

export const route: Route = {
    path: '/news/:topic?',
    name: 'News',
    url: 'newsroom.arm.com/news',
    example: '/arm/news',
    categories: ['new-media'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        topic: 'Topic slug from `https://newsroom.arm.com/topics/:topic`. Omit or use `all` for all topics.',
    },
    description: `Full-text press releases and official news from Arm Newsroom via the WordPress REST API. Returns up to 20 entries by default and supports the common \`limit\` parameter (up to 100).

${TOPIC_TABLE_EN}`,
    zh: {
        name: '新闻稿',
        parameters: {
            topic: '官网专题 slug（对应 `https://newsroom.arm.com/topics/:topic`），留空或填 `all` 表示全部专题。',
        },
        description: `通过官方 WordPress REST API 获取 Arm Newsroom 官方新闻稿与公告（\`/news/\`）全文内容。默认返回最多 20 篇，可通过通用参数 \`limit\` 调整（最大 100）。

${TOPIC_TABLE_ZH}`,
    },
    radar: [
        {
            source: ['newsroom.arm.com/news', 'newsroom.arm.com/news/:slug', 'newsroom.arm.com/'],
            target: '/news',
        },
        {
            source: ['newsroom.arm.com/topics/:topic'],
            target: '/news/:topic',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler: (ctx: Context) =>
        fetchNewsroomData(ctx, {
            endpoint: 'news',
            titlePrefix: 'Arm Newsroom - News',
            baseLink: 'https://newsroom.arm.com/news',
        }),
};
