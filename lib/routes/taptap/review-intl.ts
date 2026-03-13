import type { Route } from '@/types';

import { handler } from './common/review';

export const route: Route = {
    path: '/intl/review/:id/:order?/:lang?',
    categories: ['game'],
    example: '/taptap/intl/review/82354/recent',
    parameters: {
        id: "Game's App ID, you may find it from the URL of the Game",
        order: 'Sort Method, default is `helpful`, checkout the table below for possible values',
        lang: 'Language, checkout the table below for possible values, default is `en_US`',
    },
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
            source: ['www.taptap.io/app/:id/review', 'www.taptap.io/app/:id'],
            target: '/intl/review/:id',
        },
    ],
    name: 'Ratings & Reviews',
    maintainers: ['hoilc', 'TonyRL', 'ETiV'],
    handler,
    description: `Sort Method

| Most Helpful | Most Recent |
| ------------ | ----------- |
| helpful      | recent      |

Language Code

| English (US) | 繁體中文 | 한국어 | 日本語 |
| ------------ | -------- | ------ | ------ |
| en_US       | zh_TW   | ko_KR | ja_JP |`,
};
