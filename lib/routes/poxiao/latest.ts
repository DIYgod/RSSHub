import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.poxiao.com';

export const route: Route = {
    path: '/latest',
    example: '/poxiao/latest',
    name: '最近更新',
    categories: ['multimedia'],
    maintainers: ['DIYgod'],
    radar: [{ source: ['www.poxiao.com/'], target: '/latest' }],
    handler,
};

function getItem(item: DataItem) {
    return cache.tryGet(item.link!, async () => {
        const { data: response } = await got(item.link!, { responseType: 'buffer' });
        const $ = load(iconv.decode(response, 'gbk'));
        const content = $('.inner_content');
        content.find('script, style').remove();
        content.find('img[src]').each((_, image) => {
            $(image).attr('src', new URL($(image).attr('src')!, baseUrl).href);
        });
        const downloads = $('.resourcesmain a[href]')
            .toArray()
            .filter((element) => /^(?:magnet:\?xt=urn:btih:[a-z0-9]{32,40}|https?:\/\/|ed2k:\/\/)/i.test($(element).attr('href')!))
            .map((element) => $.html(element))
            .join('<br>');
        item.description = (content.html() || '') + downloads;
        item.category = $('.channel a').last().text();
        return item;
    });
}

async function handler(ctx) {
    const { data: response } = await got(baseUrl, { responseType: 'buffer' });
    const $ = load(iconv.decode(response, 'gbk'));
    const seen = new Set<string>();
    const limit = Number(ctx.req.query('limit')) || 20;
    const items = $('li:has(.date)')
        .toArray()
        .map((element) => {
            const anchor = $(element).find('a[href]').last();
            return { title: anchor.text(), link: new URL(anchor.attr('href')!, baseUrl).href, pubDate: parseDate($(element).find('.date').text()) };
        })
        .filter((item) => {
            if (seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    return { title: '破晓电影 - 最近更新', link: baseUrl, language: 'zh-CN' as const, item: await pMap(items, getItem, { concurrency: 3 }) };
}
