import { Route } from '@/types';
import { handler } from './common/changelog';

export const route: Route = {
    path: '/intl/changelog/:id/:lang?',
    categories: ['game'],
    example: '/taptap/intl/changelog/191001/zh_TW',
    parameters: {
        id: "Game's App ID, you may find it from the URL of the Game",
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
            source: ['www.taptap.io/app/:id'],
            target: '/intl/changelog/:id',
        },
    ],
    name: "Game's Changelog",
    maintainers: ['hoilc', 'ETiV'],
    handler,
    description: `Language Code

  | English (US) | 繁體中文 | 한국어 | 日本語 |
  | ------------ | -------- | ------ | ------ |
  | en_US       | zh_TW   | ko_KR | ja_JP |`,
};
