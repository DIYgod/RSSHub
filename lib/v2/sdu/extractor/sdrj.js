const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        let content, author, exactDate;
        try {
            const result = await got(link);
            const $ = cheerio.load(result.data);
            content = $('#vsb_content').html();
            author = $("form[name='_newscontent_fromname'] > h1").text();
            const exactDateLine = $("form[name='_newscontent_fromname'] > p.info").text().trim();
            const exactDateText = exactDateLine.match(/^发布时间：(?<date>\d+\/\d+\/\d+\s\d{2}:\d{2}:\d{2})/).groups.date;
            exactDate = parseDate(exactDateText, 'YYYY/MM/DD HH:mm:ss');
            return { description: content, author, exactDate };
        } catch (e) {
            return { description: content, author, exactDate };
        }
    });
