import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://xg.swjtu.edu.cn';
const listURL = {
    tzgg: `${rootURL}/web/Home/PushNewsList?Lmk7LJw34Jmu=010j.shtml`,
    yhxw: `${rootURL}/web/Home/NewsList?LJw34Jmu=011e.shtml`,
    dcxy: `${rootURL}/web/Home/ColourfulCollegeNewsList`,
    xgzj: `${rootURL}/web/Home/NewsList?xvw34vmu=010e.shtml`,
};

const getItem = async (item) => {
    const newsInfo = item.find('h4').find('a');
    const newsTime = item.find('span.ctxlist-time').text();
    const newsTitle = newsInfo.text();
    const link = `${rootURL}${newsInfo.attr('href')}`;
    const details = await cache.tryGet(`swjtu:xg:article:${link}`, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = load(resp.data);
            const newsText = $$('.detail-content-text').html();
            return {
                description: newsText || undefined,
            };
        } catch (error) {
            if (error instanceof FetchError && error.statusCode === 404) {
                return {
                    description: '',
                };
            }
            throw error;
        }
    });
    return { title: newsTitle, pubDate: newsTime ? timezone(parseDate(newsTime, 'YYYY-MM-DD'), 8) : undefined, link, ...details };
};

export const route: Route = {
    path: '/xg/:code?',
    categories: ['university'],
    example: '/swjtu/xg/tzgg',
    parameters: { code: '栏目(默认为tzgg)' },
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
            source: ['xg.swjtu.edu.cn/web/Home/PushNewsList', 'xg.swjtu.edu.cn/web/Home/NewsList', 'xg.swjtu.edu.cn/web/Home/ColourfulCollegeNewsList', 'xg.swjtu.edu.cn/web/Publicity/List', 'xg.swjtu.edu.cn/'],
            target: '/xg',
        },
    ],
    name: '扬华素质网',
    maintainers: ['mobyw'],
    handler,
    url: 'xg.swjtu.edu.cn/web/Home/PushNewsList',
    description: `栏目列表：

| 通知公告 | 扬华新闻 | 多彩学院 | 学工之家 |
| -------- | -------- | -------- | -------- |
| tzgg     | yhxw     | dcxy     | xgzj     |`,
};

async function handler(ctx) {
    const code = ctx.req.param('code') ?? 'tzgg';
    const pageURL = listURL[code];

    if (!pageURL) {
        throw new InvalidParameterError('code not supported');
    }

    const resp = await got({
        method: 'get',
        url: pageURL,
    });

    const $ = load(resp.data);
    const list = $('div.right-side ul.block-ctxlist li');

    const items = await pMap(
        list.toArray(),
        (i) => {
            const item = $(i);
            return getItem(item);
        },
        { concurrency: 3 }
    );

    return {
        title: '西南交大-扬华素质网',
        link: pageURL,
        item: items,
    };
}
