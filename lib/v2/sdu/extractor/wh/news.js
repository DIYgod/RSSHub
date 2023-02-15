const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = (link, ctx) =>
    ctx.cache.tryGet(link, async () => {
        let content, author, exactDate;
        try {
            const result = await got(link);
            const $ = cheerio.load(result.data);
            content = $('#main-content').html();
            author = $('#source').text();
            const exactDateLine = $('.news_tit > p:last-child').text();
            const exactDateText = exactDateLine.match(/^发布日期：(?<date>\d+年\d+月\d+日\s\d{2}:\d{2})/).groups.date;
            exactDate = timezone(parseDate(exactDateText, 'YYYY年MM月DD日 HH:mm'), +8);
            return { description: content, author, exactDate };
        } catch (e) {
            return { description: content, author, exactDate };
        }
    });
