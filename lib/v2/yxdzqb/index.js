const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'https://www.yxdzqb.com';

const map = {
    new: 'index_discount.html',
    hot: 'index_popular.html',
    hot_chinese: 'index_popular_cn.html',
    low: 'index_low.html',
    low_chinese: 'index_low_cn.html',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const link = `${host}/${map.hasOwnProperty(type) ? map[type] : `index_${type}.html`}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const title = $('.btn-primary b').text() || $('.btn-danger b').text() || $('.btn-info b').text();
    const list = $('tr.bg-none');

    const out = list
        .map((index, item) => {
            item = $(item);

            const title = item.find('div table:nth-child(1) tr td:nth-child(1)').text();
            const description = art(path.join(__dirname, 'templates/description.art'), {
                src: item.find('table.cell_tabs > tbody > tr > td:nth-child(1) > img').attr('src'),
                description: item.find('div.collapse').html(),
            });
            const link = item.find('div.collapse table.cell_tabs > tbody > tr > td:nth-child(1) > a').attr('href');
            const guid = link + item.find('div.cell_price span:nth-child(2)').text();

            const single = {
                title,
                description,
                link,
                guid,
            };
            return single;
        })
        .get();

    ctx.state.data = {
        title: `${title}-游戏打折情报`,
        link,
        item: out,
    };
};
