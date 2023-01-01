const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://www.cnblogs.com/aggsite/topdiggs';
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
                pubDate: parseDate(item.find('.post-item-foot .post-meta-item span').text(), 'YYYY-MM-DD HH:ii:ss'),
                description: item.find('.post-item-summary').text(), 
            };
        });

    ctx.state.data = {
        title: '10天推荐排行-博客园',
        link,
        item: list,
    };
};
