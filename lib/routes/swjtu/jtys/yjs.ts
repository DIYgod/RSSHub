import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'https://ctt.swjtu.edu.cn';
const sourceUrl = `${rootURL}/yjsjxnew/tzgg.htm`;

const getArticle = async (link: string) => {
    const resp = await got.get(link);
    const $ = load(resp.data);
    return $('.v_news_content').html();
};

const getItem = async (item) => {
    const title = item.find('.news-title').text();
    const month = item.find('.month').text();
    const day = item.find('.day').text();
    const date = month && day ? `${month}.${day}` : undefined;
    const link = new URL(item.find('.news-box > a').attr('href'), sourceUrl).href;
    const description = await cache.tryGet(`swjtu:jtys:article:${link}`, () => getArticle(link));
    return {
        title,
        pubDate: date ? timezone(parseDate(date, 'YYYY.MM.DD'), 8) : undefined,
        link,
        description,
    };
};

export const route: Route = {
    path: '/jtys/yjs',
    categories: ['university'],
    example: '/swjtu/jtys/yjs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '交通运输与物流学院',
    maintainers: ['qizidog'],
    handler,
    description: '#### 研究生通知 {#xi-nan-jiao-tong-da-xue-jiao-tong-yun-shu-yu-wu-liu-xue-yuan-yan-jiu-sheng-tong-zhi}',
};

async function handler() {
    const resp = await got({
        method: 'get',
        url: sourceUrl,
    });

    const $ = load(resp.data);
    const list = $('.news-list.flex');

    const items = await pMap(list.toArray(), (item) => getItem($(item)), { concurrency: 3 });

    return {
        title: '西南交大交运学院-研究生通知',
        link: sourceUrl,
        item: items,
    };
}
