const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '669';

    const currentUrl = `${rootUrl}/feed/${id}`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbytid?id=${id}&page=0&pagesize=${ctx.query.limit ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = await ProcessItems(apiUrl, ctx.cache.tryGet);

    ctx.state.data = {
        title: `第一财经主题 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
