const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = (link, ctx) =>
    ctx.cache.tryGet(link, async () => {
        let content, exactDate;
        try {
            const result = await got(link);
            const $ = cheerio.load(result.data);
            const form = $("form[name='_newscontent_fromname']");
            form.find('h2').remove();
            const exactDateElement = form.find('#author');
            const exactDateStr = exactDateElement.text();
            exactDateElement.remove();
            content = form.html();
            const exactDateText = exactDateStr.match(/^创建时间：(?<date>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/).groups.date;
            exactDate = timezone(parseDate(exactDateText, 'YYYY-MM-DD HH:mm:ss'), +8);
            return { description: content, exactDate };
        } catch (e) {
            return { description: content, exactDate };
        }
    });
