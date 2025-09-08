import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import utils from './utils';

export const route: Route = {
    path: '/hot-search',
    categories: ['social-media'],
    example: '/bilibili/hot-search',
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
            source: ['www.bilibili.com/', 'm.bilibili.com/'],
        },
    ],
    name: '热搜',
    maintainers: ['CaoMeiYouRen'],
    handler,
    url: 'www.bilibili.com/',
};

async function handler() {
    const wbiVerifyString = await cache.getWbiVerifyString();
    const params = utils.addWbiVerifyInfo('limit=10&platform=web', wbiVerifyString);
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/square?${params}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://api.bilibili.com`,
        },
    });
    const trending = response?.data?.data?.trending;
    const title = trending?.title;
    const list = trending?.list || [];
    return {
        title,
        link: url,
        description: 'bilibili热搜',
        item: list.map((item) => ({
            title: item.keyword,
            description: `${item.keyword}<br>${item.icon ? `<img src="${item.icon}">` : ''}`,
            link: item.link || item.goto || `https://search.bilibili.com/all?${new URLSearchParams({ keyword: item.keyword })}&from_source=webtop_search`,
        })),
    };
}
