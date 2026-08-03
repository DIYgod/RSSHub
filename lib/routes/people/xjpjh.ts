import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'http://jhsjk.people.cn';

export const route: Route = {
    path: '/xjpjh/:keyword?/:year?',
    categories: ['traditional-media'],
    example: '/people/xjpjh',
    parameters: { keyword: '关键词，默认不填', year: '年份，默认 all' },
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
            source: ['jhsjk.people.cn/'],
            target: '/xjpjh',
        },
    ],
    name: '习近平系列重要讲话',
    maintainers: ['LogicJake'],
    handler,
    url: 'jhsjk.people.cn',
};

async function handler(ctx) {
    const requestedKeyword = ctx.req.param('keyword');
    const requestedYear = ctx.req.param('year');
    if (requestedYear && requestedYear !== 'all' && !/^\d{4}$/.test(requestedYear)) {
        throw new InvalidParameterError(`Invalid year '${requestedYear}'`);
    }

    const keyword = requestedKeyword && requestedKeyword !== 'all' ? requestedKeyword : '';
    const year = requestedYear && requestedYear !== 'all' ? requestedYear : '0';
    const requestedLimit = Number(ctx.req.query('limit') ?? 10);
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 10) : 10;
    const title = `习近平系列重要讲话-${keyword || 'all'}-${year === '0' ? 'all' : year}`;
    const resultUrl = new URL('/result', host);
    resultUrl.searchParams.set('keywords', keyword);
    resultUrl.searchParams.set('year', year);
    const link = resultUrl.href;
    const response = await got.get(link);

    const $ = load(response.data);

    const list = $('#news_list > li > a[href]')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const item = $(element);
            return {
                title: item.text(),
                link: new URL(item.attr('href')!, host).href,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);
                const publishedDate = response.data.match(/发布时间：(\d{4}-\d{2}-\d{2})/)?.[1];

                return {
                    ...item,
                    description: $('div.d2txt_con.clearfix').html(),
                    ...(publishedDate && { pubDate: parseDate(publishedDate) }),
                };
            })
        )
    );

    return {
        title,
        link,
        item: out,
    };
}
