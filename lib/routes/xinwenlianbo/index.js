const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://cn.govopendata.com/xinwenlianbo/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: root_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('table.table.table-bordered > tbody > tr > td')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const title = a.text();
            return {
                title,
                link: a.attr('href'),
                description: item.find('ul').html(),
                pubDate: new Date(/(\d{4}-\d+-\d+)/.exec(title)[1] + ' 19:00 GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '新闻联播 文字版',
        link: root_url,
        item: list,
    };
};
