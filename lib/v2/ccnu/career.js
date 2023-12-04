const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://ccnu.91wllm.com';
    const link = `${host}/news/index/tag/tzgg`;

    const response = await got(link);

    const $ = cheerio.load(response.data);
    const list = $('.newsList');

    const items =
        list &&
        list.toArray().map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                pubDate: parseDate(item.find('.y').text(), 'YYYY-MM-DD'),
                link: `${host}${a.attr('href')}`,
            };
        });

    ctx.state.data = {
        title: '华中师范大学就业信息',
        link,
        item: items,
    };
};
