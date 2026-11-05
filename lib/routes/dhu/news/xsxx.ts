import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { selectItems } from '../utils';

const baseUrl = 'https://news.dhu.edu.cn/_wp3services/generalQuery?queryObj=articles&siteId=14&columnId=6410&pageIndex=1&rows=20';

export const route: Route = {
    path: '/news/xsxx',
    categories: ['university'],
    example: '/dhu/news/xsxx',
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
            source: ['news.dhu.edu.cn/6410'],
        },
    ],
    name: '学术信息',
    maintainers: ['fox2049'],
    handler,
    url: 'news.dhu.edu.cn/6410',
};

async function handler() {
    const { data } = await got(baseUrl, {
        headers: {
            Referer: 'https://news.dhu.edu.cn/6410/',
        },
    });
    const list: Array<DataItem & { link: string; pubDate: Date }> = data.data.map((item) => ({
        title: item.title,
        link: item.wapUrl,
        pubDate: timezone(parseDate(item.publishTime), 8),
        author: item.publisher,
    }));

    // item content
    const items = await pMap(
        selectItems(list),
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.new_zwCot').html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '学术信息',
        link: 'https://news.dhu.edu.cn/6410',
        item: items,
    };
}
