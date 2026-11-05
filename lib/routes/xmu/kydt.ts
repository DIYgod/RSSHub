import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

function parseSourceDate(value?: string) {
    const dateText = value?.match(/\d{4}[.-]\d{2}[.-]\d{2}/)?.[0].replaceAll('.', '-');
    if (!dateText) {
        return;
    }
    const date = parseDate(dateText, 'YYYY-MM-DD', true);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
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
                pubDate: parseSourceDate(time),
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
