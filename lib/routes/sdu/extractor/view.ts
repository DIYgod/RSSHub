import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const view = (link) =>
    cache.tryGet(`sdu:view:article-v3:${link}`, async () => {
        let content, author, exactDate;
        try {
            const result = await got(link);
            const $ = load(result.data);
            content = $('#vsb_content').html();
            author = $('.art-body > p').last().text().trim() || $("form[name='_newscontent_fromname'] > div > p:last-of-type").text();
            const currentDateText = $('.art-tit .date')
                .text()
                .match(/日期：(\d+年\d+月\d+日)/)?.[1];
            const previousDateText = $('.news_tit > p:last-child')
                .text()
                .match(/^发布日期：(\d+年\d+月\d+日\s\d{2}:\d{2})/)?.[1];
            const exactDateText = currentDateText ?? previousDateText;
            exactDate = exactDateText ? timezone(parseDate(exactDateText, currentDateText ? 'YYYY年MM月DD日' : 'YYYY年MM月DD日 HH:mm'), 8) : undefined;
            return { description: content, author, exactDate };
        } catch {
            return { description: content, author, exactDate };
        }
    });
