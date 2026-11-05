import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'http://www.szse.cn/';

function getData(content: string, option: 'title' | 'url'): string | undefined {
    const pattern = option === 'title' ? /(?<=curTitle =').*?(?=';)/ : /(?<=curHref = ').*?(?=';)/;
    return content.match(pattern)?.[0];
}
export const route: Route = {
    path: '/notice',
    categories: ['finance'],
    example: '/szse/notice',
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
            source: ['szse.cn/disclosure/notice/company/index.html', 'szse.cn/'],
        },
    ],
    name: '上市公司公告',
    maintainers: ['Jeason0228', 'nczitzk'],
    handler,
    url: 'szse.cn/disclosure/notice/company/index.html',
};

async function handler() {
    const link = 'http://www.szse.cn/disclosure/notice/company/index.html';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('.article-list .newslist li')
        .toArray()
        .map((element) => {
            const $element = $(element);
            const info = {
                title: getData($element.find('script').text(), 'title') ?? '',
                link: new URL(getData($element.find('script').text(), 'url')!, link).href,
                date: $element.find('span.time').text().trim(),
            };
            return info;
        });
    const out = await pMap(
        list,
        async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;
            const description = await cache.tryGet(`szse:notice:article:${itemUrl}`, async () => {
                const response = await got.get(itemUrl);
                const $ = load(response.data);
                return $('#desContent').html() ?? undefined;
            });
            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
            return single;
        },
        { concurrency: 3 }
    );
    return {
        title: '深圳证券交易所——上市公司公告',
        link,
        item: out,
    };
}
