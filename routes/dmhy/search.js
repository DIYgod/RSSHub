const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const parseItems = require('./items_parser');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const { data } = await axios({
        method: 'get',
        url: 'http://share.dmhy.org/topics/list',
        params: {
            keyword,
        },
    });
    const $ = cheerio.load(data);
    const item = parseItems($);
    ctx.state.data = {
        title: `动漫花园搜寻结果: ${keyword}`,
        link: `http://share.dmhy.org/topics/list?keyword=${encodeURIComponent(keyword)}`,
        description: `动漫花园搜寻结果: ${keyword}`,
        item,
    };
};
