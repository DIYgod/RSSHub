const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://aao.nuaa.edu.cn/';

const map = {
    all: 0,
    jxfw: 333,
    xspy: 334,
    jxjs: 336,
    jxzy: 334,
};

async function load(link) {
    const response = await axios.get(host + link);
    const $ = cheerio.load(response.data);
    const pubDate = new Date(
        $('.release-time')
            .text()
            .slice(-10)
            .match(/\d{4}-\d{2}-\d{2}/)
    ).toUTCString();
    const images = $('img');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${url.resolve(host, $(images[k]).attr('src'))}" referrerpolicy="no-referrer" />`);
    }
    const description = $('.detail-div').html();
    return { pubDate, description };
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    const response = await axios({
        method: 'get',
        url: host + 'index_sub/notice/' + map[type],
    });
    const $ = cheerio.load(response.data);
    const list = $('.inform-content a').get();
    const process = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const itemUrl = item.attr('onclick').slice(13, -3);
            const single = {
                title: item.text(),
                link: url.resolve(host, itemUrl),
                guid: url.resolve(host, itemUrl),
            };
            const other = await load(itemUrl);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: '南航教务',
        link: host,
        description: '南航教务RSS',
        item: process,
    };
};
