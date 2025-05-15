import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import fetch from './fetch-article';

export const route: Route = {
    path: '/newest',
    categories: ['new-media', 'popular'],
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
    const base = `https://www.twreporter.org`;
    const url = `https://go-api.twreporter.org/v2/index_page`;
    const res = await ofetch(url);
    const list = res.data.latest_section;
    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            return cache.tryGet(item.slug, async () => {
                const single = await fetch(item.slug);
                single.title = title;
                return single;
            });
        })
    );

    return {
        title: `報導者 | 最新`,
        link: base,
        item: out,
    };
}
