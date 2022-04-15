const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        try {
            const result = await got(link);
            const $ = cheerio.load(result.data);
            const content = $('#vsb_content').html();
            const author = $("form[name='_newscontent_fromname'] > div > p:last-of-type").text();
            const exactDateLine = $('.news_tit > p:last-child').text();
            const exactDateText = exactDateLine.match(/^发布日期：(?<date>\d+年\d+月\d+日\s\d{2}:\d{2})/).groups.date;
            const exactDate = parseDate(exactDateText, 'YYYY年MM月DD日 HH:mm');
            return { description: content, author, exactDate };
        } catch (e) {
            return {};
        }
    });
