import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import util from './utils';

export const route: Route = {
    path: '/home',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/jianshu/home',
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
            source: ['www.jianshu.com/'],
        },
    ],
    name: '首页',
    maintainers: ['DIYgod', 'HenryQW', 'JimenezLi'],
    handler,
    url: 'www.jianshu.com/',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://www.jianshu.com',
        headers: {
            Referer: 'https://www.jianshu.com',
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('.note-list li').toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: '简书首页',
        link: 'https://www.jianshu.com',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
}
