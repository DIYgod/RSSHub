const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.wanqu.co';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const items = $('div.mb-4')
        .toArray()
        .map((item) => ({
            title: $(item).text(),
            link: $(item).find('a').attr('href'),
            pubDate: parseDate($(item).find('i.text-helper-color.mr-4').text()),
        }));

    ctx.state.data = {
        title: '湾区日报 - 最新推荐',
        link: currentUrl,
        item: items,
    };
};
