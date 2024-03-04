// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

module.exports = (link) =>
    cache.tryGet(link, async () => {
        let content, author, exactDate;
        try {
            const result = await got(link);
            const $ = load(result.data);
            content = $('#vsb_content').html();
            author = $("form[name='_newscontent_fromname'] > h1").text();
            const exactDateLine = $("form[name='_newscontent_fromname'] > p.info").text().trim();
            const exactDateText = exactDateLine.match(/^发布时间：(?<date>\d+\/\d+\/\d+\s\d{2}:\d{2}:\d{2})/).groups.date;
            exactDate = timezone(parseDate(exactDateText, 'YYYY/MM/DD HH:mm:ss'), +8);
            return { description: content, author, exactDate };
        } catch {
            return { description: content, author, exactDate };
        }
    });
