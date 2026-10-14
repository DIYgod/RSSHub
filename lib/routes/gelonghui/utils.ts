import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseItem = async (item: DataItem) => {
    const { date, ...detail } = await cache.tryGet(`${item.link}:detail:v2`, async () => {
        const { data: res } = await got(item.link!);
        const $ = load(res);
        if (item.link!.startsWith('https://www.gelonghui.com/live/')) {
            return {
                title: $('.type-name').next().text().trim(),
                description: $('.dtb-content').html(),
                date: undefined,
            };
        }
        if (item.link!.startsWith('https://www.gelonghui.com/news/')) {
            return {
                title: $('.news-left-top h1.title').text(),
                description: $('article.main-news').html(),
                date: $('.news-date-about .date').text(),
            };
        }
        return {
            title: $('.article-title').text().trim(),
            description: $('.article-summary').html()! + $('article.article-with-html').html()!,
            date: $('time.date').text(),
        };
    });
    let pubDate = item.pubDate;
    if (!pubDate && date) {
        const isRelativeDate = date.includes('前') || date.includes('天');
        pubDate = isRelativeDate ? parseRelativeDate(date) : timezone(parseDate(date, ['YYYY年MM月DD日 HH时mm分', 'MM-DD HH:mm']), 8);
    }
    return { ...item, ...detail, pubDate };
};

export { parseItem };
