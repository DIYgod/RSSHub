const { processItems } = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'http://www.pbc.gov.cn';

module.exports = async (ctx) => {
    const url = `${host}/redianzhuanti/118742/4122386/4122510/index.html`;

    const response = await got.post(url);
    const $ = cheerio.load(response.data);
    const list = $('li.clearfix')
        .map((_index, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            pubDate: timezone(parseDate($(item).find('span.fr').text(), 'YYYY-MM-DD'), +8),
        }))
        .get();

    const items = await processItems(list, ctx);

    ctx.state.data = {
        title: '中国人民银行 政策研究',
        link: url,
        item: items,
    };
};
