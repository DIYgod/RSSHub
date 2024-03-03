// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.hellobtc.com';

export default async (ctx) => {
    const url = `${rootUrl}/news`;

    const response = await got(url);
    const $ = load(response.data);
    const items = $('nav.js-nav')
        .find('div.item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.sub').text(),
            pubDate: timezone(parseDate($(item).find('span.date').text(), 'MM-DD HH:mm'), +8),
        }))
        .filter(Boolean)
        .get();

    ctx.set('data', {
        title: `白话区块链 - 快讯`,
        link: url,
        item: items,
    });
};
