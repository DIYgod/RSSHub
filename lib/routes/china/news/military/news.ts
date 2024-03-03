// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const commonList = $('.item_list li');
    ctx.set('data', {
        title: '中华网-军事新闻',
        link: 'https://military.china.com/news/',
        item:
            commonList &&
            commonList
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('h3.item_title').text(),
                        author: '中华网军事',
                        category: '中华网军事',
                        pubDate: parseDate(item.find('em.item_time').text()),
                        description: item.find('.item_source').text(),
                        link: item.find('h3.item_title a').attr('href'),
                    };
                })
                .get(),
    });
};
