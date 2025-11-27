import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/europechinese/latest',
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
            source: ['europechinese.blogspot.com'],
        },
    ],
    name: '最新',
    maintainers: ['emdoe'],
    handler,
    url: 'europechinese.blogspot.com/',
};

async function handler() {
    const url = `https://europechinese.blogspot.com/`;
    const { data: response } = await got(url);
    const $ = load(response);
    const list = $('h3.post-title');

    const out = await Promise.all(
        list.map((_, item) => {
            const title = $(item).find('a').text();
            const link = $(item).find('a').attr('href');

            return cache.tryGet(link, async () => {
                const { data: response } = await got(link);
                const $ = load(response);
                $('div.widget-content').remove();
                $('div.byline').remove();
                $('div.post-sidebar').remove();
                const time = $('time.published').attr('datetime');
                const text = $('div.post-body-container').html();

                return {
                    title,
                    link,
                    guid: link,
                    description: text,
                    pubDate: time,
                };
            });
        })
    );

    return {
        title: `歐洲動態（國際）| 最新`,
        link: url,
        item: out,
    };
}
