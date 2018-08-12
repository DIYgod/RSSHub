const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../../config');

module.exports = async (ctx) => {
    const url = 'https://cloud.tencent.com/document/product/454/7878';

    let resultItem = [];
    const cache = ctx.cache.get(url);
    if (cache) {
        resultItem = JSON.parse(cache);
    } else {
        const res = await axios({
            method: 'get',
            url: url,
            headers: {
                'User-Agent': config.ua,
            },
        });
        const data = res.data;
        const $ = cheerio.load(data);
        $('#docArticleContent')
            .find('h3')
            .each(function() {
                const item = {};
                item.title = $(this).text();
                item.description = $(this)
                    .nextUntil('h3')
                    .text();
                item.link = url;
                resultItem.push(item);
            });
        ctx.cache.set(url, JSON.stringify(resultItem), 24 * 60 * 60);
    }

    ctx.state.data = {
        title: '腾讯移动直播 SDK 更新日志',
        link: url,
        item: resultItem,
    };
};
