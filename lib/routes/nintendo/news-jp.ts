import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/jp',
    categories: ['game'],
    example: '/nintendo/news/jp',
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
            source: ['nintendo.com/jp'],
        },
    ],
    name: 'News（Hong Kong）',
    maintainers: ['benzking'],
    handler,
    url: 'nintendo.com/jp',
};

async function handler(ctx) {
    const response = await got('https://www.nintendo.com/jp/topics/c/api/json_list?key=newtopics');
    const data = response.data.slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30);

    // 获取新闻正文
    const result = await util.ProcessNews(data, cache);

    return {
        title: 'Nintendo（日本）主页资讯',
        link: 'https://www.nintendo.com/jp/topics',
        description: 'Nintendo JP',
        item: result.map((item) => ({
            title: item.title,
            description: item.content,
            link: item.topic_url,
            pubDate: parseDate(item.release_date, 'YYYY/MM/DD HH:mm:ss'), // "release_date": "2024/10/18 17:00:00"
        })),
    };
}
