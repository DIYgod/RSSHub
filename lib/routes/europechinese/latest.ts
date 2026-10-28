import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const url = 'https://europechinese.blogspot.com/';
    const { data: response } = await got(url);
    const $ = load(response);
    const list = $('h3.post-title')
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            link: $(item).find('a').attr('href'),
            time: $(item).closest('.heroPost, .post-outer-container').find('time.published').attr('datetime'),
        }));

    const out = await pMap(
        list,
        ({ title, link }) =>
            cache.tryGet(link!, async () => {
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
                    pubDate: time ? parseDate(time) : undefined,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: '歐洲動態（國際）| 最新',
        link: url,
        item: out,
    };
}
