import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'http://jwc.swjtu.edu.cn';
const pageURL = `${rootURL}/vatuu/WebAction?setAction=newsList`;

const getItem = (item, cache) => {
    const newsInfo = item.find('h3').find('a');
    const newsTime = item.find('p').find('span').text().slice(0, 19);
    const newsTitle = newsInfo.text();
    const link = `${rootURL}${newsInfo.attr('href').slice(2)}`;
    return cache.tryGet(link, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = load(resp.data);
            let newsText = $$('.content-main').html();
            if (!newsText) {
                newsText = '转发通知';
            }
            return {
                title: newsTitle,
                pubDate: parseDate(String(newsTime)),
                link,
                description: newsText,
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    title: newsTitle,
                    pubDate: parseDate(String(newsTime)),
                    link,
                    description: '',
                };
            } else {
                throw error;
            }
        }
    });
};

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/swjtu/jwc',
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
            source: ['jwc.swjtu.edu.cn/vatuu/WebAction', 'jwc.swjtu.edu.cn/'],
        },
    ],
    name: '教务网',
    maintainers: ['mobyw'],
    handler,
    url: 'jwc.swjtu.edu.cn/vatuu/WebAction',
};

async function handler() {
    const resp = await got({
        method: 'get',
        url: pageURL,
    });

    const $ = load(resp.data);
    const list = $("[class='littleResultDiv']");

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, cache);
        })
    );

    return {
        title: '西南交大-教务网通知',
        link: pageURL,
        item: items,
        allowEmpty: true,
    };
}
