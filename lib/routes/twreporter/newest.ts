import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getArticleItem } from './fetch-article';

export const route: Route = {
    path: '/newest',
    categories: ['new-media'],
    example: '/twreporter/newest',
    parameters: {},
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
            source: ['twreporter.org/'],
        },
    ],
    name: '最新',
    maintainers: ['emdoe'],
    handler,
    url: 'twreporter.org/',
};

async function handler() {
    const base = 'https://www.twreporter.org';
    const url = 'https://go-api.twreporter.org/v2/index_page';
    const res = await ofetch(url);
    const list = res.data.latest_section;
    const out = await pMap(list, getArticleItem, { concurrency: 3 });

    return {
        title: '報導者 | 最新',
        link: base,
        item: out,
    };
}
