import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const host = 'http://jhsjk.people.cn';

const parseCalendarDate = (date: string | undefined) => {
    if (!date) {
        return;
    }
    // UTC midnight represents the source calendar day, not its publication time.
    const parsed = timezone(parseDate(date, 'YYYY-MM-DD', true), 0);
    return Number.isFinite(parsed.getTime()) ? parsed : undefined;
};

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
    const limit = Math.min(getRouteLimit(ctx, 10), 10);
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
                pubDate: parseCalendarDate(
                    item
                        .parent()
                        .children('span')
                        .last()
                        .text()
                        .match(/\[(\d{4}-\d{2}-\d{2})\]/)?.[1]
                ),
            };
        });

    const out = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`people:xjpjh:calendar:v2:${item.link}`, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);
                const publishedDate = response.data.match(/发布时间：(\d{4}-\d{2}-\d{2})/)?.[1];

                return {
                    description: $('div.d2txt_con.clearfix').html(),
                    pubDate: parseCalendarDate(publishedDate),
                };
            });
            return { ...item, description: detail.description, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title,
        link,
        item: out,
    };
}
