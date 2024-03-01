const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `https://www.cnblogs.com${ctx.path}`;
    const response = await got(link);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#post_list article')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.post-item-title').text(),
                link: item.find('.post-item-title').attr('href'),
                pubDate: timezone(parseDate(item.find('.post-item-foot .post-meta-item span').text() || item.find('.editorpick-item-meta').text(), ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD']), +8),
                description: item.find('.post-item-summary').text(),
                author: item.find('.post-item-author span').text(),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link,
        item: list,
    };
};
