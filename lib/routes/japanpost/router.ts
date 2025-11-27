import type { Route } from '@/types';

import { track } from './track';

export const route: Route = {
    name: 'Track & Trace Service',
    path: '/track/:reqCode/:locale?',
    example: '/japanpost/track/EJ123456789JP/en',
    url: 'trackings.post.japanpost.jp/services/srv/search/',
    handler: track,
    categories: ['other'],
    maintainers: ['tuzi3040'],
    parameters: {
        reqCode: 'Package Number',
        locale: 'Language, default to japanese `ja`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false, // unsupported due to deprecation of `target` as a function in RSSHub-Radar 2.0.19
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| Japanese | English |
| -------- | ------- |
| ja       | en      |`,
    zh: {
        name: '邮件追踪查询',
        description: `| 日语 | 英语 |
| ---- | ---- |
| ja   | en   |`,
    },
    ja: {
        name: '郵便追跡サービス',
        description: `| 日本語 | 英語 |
| ---- | ---- |
| ja   | en   |`,
    },
};
