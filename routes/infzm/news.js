const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

const baseUrl = 'http://www.infzm.com/contents/';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${baseUrl}${id}`;
    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('article');
    ctx.state.data = {
        title: `${$('title').text()}-${$('#sortName')
            .find('a')
            .text()}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((item, index) => {
                    item = $(index);
                    const info = item
                        .find('div.clearfix>div>p.articleInfo')
                        .text()
                        .trim()
                        .split(/\s+/);
                    const date = new Date(`${info.slice(-2)[0]}T${info.slice(-1)[0]}`);
                    return {
                        title: item.find('div.articleTitle>h>a').text(),
                        description: `${item.find('div.clearfix>div>p.intro').text()}<img referrerpolicy="no-referrer" src="${item.find('img').attr('src')}">`,
                        pubDate: date.toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
