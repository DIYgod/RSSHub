import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

import fetch from './fetch-article';

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
    const url = 'https://www.twreporter.org';
    const res = await got(url);
    const $ = load(res.data);
    const list = $('.gKMjSz').get();

    const out = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const address = url + $('a').attr('href');
            const title = $('.latest-section__Title-hzxpx3-6').text();
            return cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                return single;
            });
        })
    );
    return {
        title: `報導者 | 最新`,
        link: url,
        item: out,
    };
}
