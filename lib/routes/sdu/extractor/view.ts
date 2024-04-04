import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const view = (link) =>
    cache.tryGet(link, async () => {
        let content, author, exactDate;
        try {
            const result = await got(link);
            const $ = load(result.data);
            content = $('#vsb_content').html();
            author = $("form[name='_newscontent_fromname'] > div > p:last-of-type").text();
            const exactDateLine = $('.news_tit > p:last-child').text();
            const exactDateText = exactDateLine.match(/^发布日期：(?<date>\d+年\d+月\d+日\s\d{2}:\d{2})/).groups.date;
            exactDate = timezone(parseDate(exactDateText, 'YYYY年MM月DD日 HH:mm'), +8);
            return { description: content, author, exactDate };
        } catch {
            return { description: content, author, exactDate };
        }
    });
export default view;
