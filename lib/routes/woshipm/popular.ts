// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, parseArticle } = require('./utils');

const rangeMap = {
    daily: '日榜',
    weekly: '周榜',
    monthly: '月榜',
};

export default async (ctx) => {
    const { range = 'daily' } = ctx.req.param();
    const { data: response } = await got(`${baseUrl}/api2/app/article/popular/${range}`);

    const list = response.RESULT.map((item) => {
        item = item.data;
        return {
            title: item.articleTitle,
            description: item.articleSummary,
            link: `${baseUrl}/${item.type}/${item.id}.html`,
            pubDate: parseDate(item.publishTime, 'x'),
            author: item.articleAuthor,
        };
    });

    const result = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `热门文章 - ${rangeMap[range]} - 人人都是产品经理`,
        link: baseUrl,
        item: result,
    });
};
