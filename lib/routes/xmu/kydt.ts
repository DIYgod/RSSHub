import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/kydt',
    categories: ['university'],
    example: '/xmu/kydt',
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
            source: ['soe.xmu.edu.cn/kxyj/kydt.htm'],
        },
    ],
    name: '科研动态',
    maintainers: ['linsenwang'],
    handler,
};

async function fetchArticleContent(link: string): Promise<Pick<DataItem, 'description'>> {
    const response = await ofetch(link);
    const $ = load(response);
    return { description: $('.v_news_content').html() };
}

async function handler() {
    const host = 'https://soe.xmu.edu.cn/kxyj/kydt.htm';
    const response = await ofetch(host);
    const $ = load(response);

    const list = $('div.news li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.find('h4').text();
            const time = $item.find('h6').text();
            const a = $item.find('a').attr('href');
            const fullUrl = new URL(a!, host).href;

            return {
                title,
                link: fullUrl,
                pubDate: parseDate(time, 'YYYY.MM.DD', 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link!, () => fetchArticleContent(item.link!));
            return { ...item, description: detail.description };
        },
        { concurrency: 3 }
    );

    return {
        title: '厦门大学经济学院科研动态',
        link: host,
        item: items,
    };
}
