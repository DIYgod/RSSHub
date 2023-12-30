const { processItems } = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.pbc.gov.cn';

module.exports = async (ctx) => {
    const url = `${host}/redianzhuanti/118742/4122386/4122692/index.html`;

    const response = await got.post(url);
    const $ = cheerio.load(response.data);
    const list = $('li.clearfix')
        .map((_index, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            author: $(item).find('span.fr').text().replace(/…/g, ''),
        }))
        .get();

    const items = await processItems(list, ctx);

    ctx.state.data = {
        title: '中国人民银行 工作论文',
        link: url,
        item: items,
    };
};
