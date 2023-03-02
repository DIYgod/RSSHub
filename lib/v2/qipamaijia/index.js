const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.qipamaijia.com';

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? '';
    const url = `${rootUrl}/${cate}`;

    const response = await got({
        method: 'get',
        url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const title = $('#highlight').text();
    const items = $('div.col_l > div.block')
        .map((_index, item) => ({
            title: $(item).find('div.content').text(),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.content').html() + $(item).find('div.thumb').html(),
        }))
        .get();

    ctx.state.data = {
        title: `奇葩买家秀 - ${title}`,
        link: url,
        item: items,
    };
};
