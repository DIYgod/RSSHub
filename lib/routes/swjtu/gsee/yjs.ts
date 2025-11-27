import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://gsee.swjtu.edu.cn';
const urlAddr = `${rootURL}/xwzx/tzgg.htm`;

const getItem = (item) => {
    const newsInfo = item.find('dt');
    const newsDate = item
        .find('dd')
        .text()
        .match(/\d{4}(-|\/|.)\d{1,2}\1\d{1,2}/)[0];

    const infoTitle = newsInfo.text();
    const link = rootURL + newsInfo.find('a').last().attr('href').slice(2);
    return cache.tryGet(link, async () => {
        const resp = await ofetch(link);
        const $$ = load(resp);
        const infoText = $$('.article').html();

        return {
            title: infoTitle,
            pubDate: parseDate(newsDate),
            link,
            description: infoText,
        };
    }) as any;
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
    description: `研究生教育通知公告`,
};

async function handler() {
    const resp = await ofetch(urlAddr);
    const $ = load(resp);

    const list = $('dl');

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item);
        })
    );

    return {
        title: '西南交大地学学院-研究生通知',
        link: urlAddr,
        item: items,
        allowEmpty: true,
    };
}
