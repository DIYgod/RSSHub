import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { ProcessForm, ProcessFeed } from './utils';

export const route: Route = {
    path: '/home',
    categories: ['game'],
    example: '/lfsyd/home',
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
            source: ['www.iyingdi.com/'],
        },
    ],
    name: '首页',
    maintainers: ['auto-bot-ty'],
    handler,
    url: 'www.iyingdi.com/',
};

async function handler() {
    const rootUrl = 'https://www.iyingdi.com';
    const url = 'https://api.iyingdi.com/mweb/feed/recommend-content-list';
    const form = {
        size: 30,
        timestamp: '',
    };
    const response = await got({
        method: 'post',
        url,
        headers: {
            'App-Udid': 'unknown',
            Host: 'api.iyingdi.com',
            'Login-Token': 'nologin',
            Origin: 'https://mob.iyingdi.com',
            Platform: 'mweb',
            Preid: '86f2007de00272e24a54831a621aecc5',
            Referer: 'https://mob.iyingdi.com/',
        },
        form: ProcessForm(form, 'mweb'),
    });
    const { posts } = response.data;

    const articleList = posts.map((item) => ({
        title: item.post.title,
        pubDate: parseDate(item.post.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.post.id}`,
        guid: item.post.title,
        postId: item.post.id,
    }));
    const items = await ProcessFeed(cache, articleList);

    return {
        title: '首页 - 旅法师营地',
        link: rootUrl,
        item: items,
    };
}
