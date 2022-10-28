const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '100005663';

    const currentUrl = `${rootUrl}/author/${id}.html`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbysid?id=${id}&page=1&pagesize=${ctx.query.limit ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = await ProcessItems(apiUrl, ctx.cache.tryGet);

    ctx.state.data = {
        title: `第一财经一财号 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
