const got = require('@/utils/got');
const cheerio = require('cheerio');
const qs = require('query-string');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const link = 'https://getitfree.cn';
    const query = {
        s: keyword,
    };
    const res = await got(link, {
        query,
    });
    const $ = cheerio.load(res.data);

    const item = utils.parseListItem($, '#page-content');

    ctx.state.data = {
        title: `正版中国搜索 - ${keyword}`,
        description: `正版中国搜索 - ${keyword}`,
        link: `${link}?${qs.stringify(query)}`,
        item,
    };
};
