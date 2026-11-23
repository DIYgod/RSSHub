import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

const baseUrl = 'https://www.ebrun.com';

export const route: Route = {
    path: '/news/:section?',
    example: '/ebrun/news/information',
    name: '最新资讯和快讯',
    categories: ['new-media'],
    maintainers: ['DIYgod'],
    parameters: { section: 'information：最新资讯（默认）；newest：快讯。' },
    radar: [
        { source: ['www.ebrun.com/information'], target: '/news/information' },
        { source: ['www.ebrun.com/newest'], target: '/news/newest' },
    ],
    handler,
};

let cookie = '';
async function fetchPage(url: string) {
    const response = await ofetch<string>(url, { headers: { cookie } });
    const challenge = response.match(/cookie="(C3VK=\w+);/);
    if (!challenge) {
        return response;
    }
    cookie = challenge[1];
    return ofetch<string>(url, { headers: { cookie } });
}

function getItem(item: DataItem) {
    // only follow links on the site itself
    if (!isOnSite(item.link, 'ebrun.com')) {
        return item;
    }
    return cache.tryGet(item.link!, async () => {
        const response = await fetchPage(item.link!);
        const $ = load(response);
        item.description = $('.post-text').html();
        item.pubDate = parseDate($('.post-header .date-time').text(), 'YYYY-MM-DD HH:mm', 8);
        item.author = $('.post-header .source .info span')
            .first()
            .text()
            .replace(/^作者[：:]\s*/, '');
        item.category = $('.article-label a')
            .toArray()
            .map((element) => $(element).text());
        return item;
    });
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'information';
    if (!['information', 'newest'].includes(section)) {
        throw new InvalidParameterError('Choose information or newest.');
    }
    const link = `${baseUrl}/${section}/`;
    const selector = section === 'information' ? '.news-item .title a' : '#quick-list .quick-list__item-title a';
    const response = await fetchPage(link);
    const $ = load(response);
    const requestedLimit = getRouteLimit(ctx, 20);
    const detailLimit = ctx.req.query('sorted') === 'false' ? requestedLimit : Math.max(20, requestedLimit);
    const items = $(selector)
        .toArray()
        .slice(0, detailLimit)
        .map((element): DataItem => ({ title: $(element).text(), link: new URL($(element).attr('href')!, baseUrl).href }));
    return { title: `亿邦动力 - ${section === 'information' ? '最新资讯' : '快讯'}`, link, language: 'zh-CN' as const, item: await pMap(items, (item) => getItem(item), { concurrency: 3 }) };
}
