import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'https://sports.swjtu.edu.cn';
const pageURL = `${rootURL}/xwzx.htm`;

export const route: Route = {
    path: '/sports',
    categories: ['university'],
    example: '/swjtu/sports',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sports.swjtu.edu.cn/'],
        },
    ],
    name: '体育学院',
    description: '新闻资讯',
    maintainers: ['AzureG03'],
    handler,
};

const getItem = async (item) => {
    const title = item.find('p.toe').text();
    const link = `${rootURL}/${item.find('a').attr('href')}`;

    const details = await cache.tryGet(`swjtu:sports:article:${link}`, async () => {
        const res = await ofetch(link);
        const $ = load(res);

        const date = $('div.info span:nth-of-type(3)')
            .text()
            .match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];
        const pubDate = date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined;
        const description = $('div.detail-wrap').html();
        return {
            pubDate,
            description,
        };
    });
    return { title, link, ...details };
};

async function handler() {
    const res = await ofetch(pageURL);

    const $ = load(res);
    const $list = $('div.news-list > ul > li');

    const items = await pMap(
        $list.toArray(),
        (i) => {
            const $item = $(i);
            return getItem($item);
        },
        { concurrency: 3 }
    );

    return {
        title: '西南交大体院-新闻资讯',
        link: pageURL,
        item: items,
    };
}
