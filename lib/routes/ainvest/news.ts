import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getHeaders, randomString, decryptAES } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/ainvest/news',
    parameters: {},
    view: ViewType.Articles,
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
            source: ['ainvest.com/news'],
        },
    ],
    name: 'Latest News',
    maintainers: ['TonyRL'],
    handler,
    url: 'ainvest.com/news',
};

async function handler(ctx) {
    const key = randomString(16);

    const { data: response } = await got('https://api.ainvest.com/gw/news_f10/v1/newsFlash/getNewsData', {
        headers: getHeaders(key),
        searchParams: {
            terminal: 'web',
            tab: 'all',
            page: 1,
            size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50,
            lastId: '',
            timestamp: Date.now(),
        },
    });

    const { data } = JSON.parse(decryptAES(response, key));

    const items = data.content.map((item) => ({
        title: item.title,
        description: item.content,
        link: item.sourceUrl,
        pubDate: parseDate(item.publishTime, 'x'),
        category: item.tagList.map((tag) => tag.nameEn),
        author: item.userInfo.nickname,
        upvotes: item.likeCount,
        comments: item.commentCount,
    }));

    return {
        title: 'AInvest - Latest News',
        link: 'https://www.ainvest.com/news',
        language: 'en',
        item: items,
    };
}
