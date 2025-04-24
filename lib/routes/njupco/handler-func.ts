import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export async function handler() {
    interface NewsItem {
        title: string,
        link: string,
        pudDate: Date | null,
        description: string,
    }
    const TARGET_URL = 'http://www.njupco.com/news/press';
    const $ = await cheerio.fromURL(TARGET_URL);
    const items: NewsItem[] = [];
    const promises: Promise<void>[] = [];
    $('div.left_con ul li').each((_, el) => {
        const linkUrl = $(el).children('b').children('a').attr('href');
        if (linkUrl?.includes('weixin') === true) {
            const content = $(el).children('div').text();
            const item: NewsItem= {
                title: $(el).children('b').children('a').text(),
                link: linkUrl!,
                pubDate: el ? parseDate($(el).children('span').text()) : null,
                description: `${content} <a href=${$(el).children('b').children('a').attr('href')}>点击阅读微信公众号原文</a>`,
            };
            items.push(item);
        } else {
            const contentUrl = `http://www.njupco.com${linkUrl}`;
            const promise =  cheerio.fromURL(contentUrl)
            .then(($content) => {
                const content = $content('div.content').html();
                const REGEX_DATE = /[1-2][0-9]+\-[0-1]?[0-9]\-[0-2]?[0-9] [0-2][0-9]:[0-6][0-9]:[0-6][0-9]/;
                const dateOrigin = $content('div.ny_con').children('h2').text();
                const date = dateOrigin.match(REGEX_DATE);
                const item: NewsItem = {
                    title: $(el).children('b').children('a').text(),
                    link: linkUrl!,
                    pubDate: date ? parseDate(date[0]) : null,
                    description: content,
                };
                items.push(item);
            });
            promises.push(promise);
        };
    });

    await Promise.all(promises);

    return {
        title: '南京大学出版社',
        link: 'http://www.njupco.com/news/press',
        item: items,
    };
};
