import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'https://gsee.swjtu.edu.cn';
const urlAddr = `${rootURL}/xwzx/tzgg.htm`;

const getItem = async (item) => {
    const newsInfo = item.find('dt');
    const newsDate = item
        .find('dd')
        .text()
        .match(/\d{4}(.)\d{1,2}\1\d{1,2}/)?.[0];

    const infoTitle = newsInfo.text();
    const link = rootURL + newsInfo.find('a').last().attr('href').slice(2);
    const details = await cache.tryGet(`swjtu:gsee:article:${link}`, async () => {
        const resp = await ofetch(link);
        const $$ = load(resp);
        const infoText = $$('.article').html();

        return {
            description: infoText,
        };
    });
    return { title: infoTitle, pubDate: newsDate ? timezone(parseDate(newsDate, 'YYYY-MM-DD'), 8) : undefined, link, ...details };
};

export const route: Route = {
    path: '/gsee/yjs',
    categories: ['university'],
    example: '/swjtu/gsee/yjs',
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
            source: ['gsee.swjtu.edu.cn/'],
        },
    ],
    name: '地球科学与工程学院',
    maintainers: ['E1nzbern'],
    handler,
    description: '研究生教育通知公告',
};

async function handler() {
    const resp = await ofetch(urlAddr);
    const $ = load(resp);

    const list = $('dl');

    const items = await pMap(
        list.toArray(),
        (i) => {
            const item = $(i);
            return getItem(item);
        },
        { concurrency: 3 }
    );

    return {
        title: '西南交大地学学院-研究生通知',
        link: urlAddr,
        item: items,
    };
}
