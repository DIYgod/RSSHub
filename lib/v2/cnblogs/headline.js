const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://www.cnblogs.com/aggsite/headline';
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
                pubDate: parseDate(item.find('.editorpick-item-meta').text(), 'YYYY-MM-DD'),
            };
        });

    ctx.state.data = {
        title: '编辑推荐-博客园',
        link,
        item: list,
    };
};
