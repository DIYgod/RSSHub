const utils = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { name = 'newest' } = ctx.params;
    const html = await got(name === 'newest' ? `https://aijishu.com/` : `https://aijishu.com/channel/${name}`);

    const $ = cheerio.load(html.data);
    const title = $('title').text().split('-')[0].trim();
    const api_path = $('li[data-js-stream-load-more]').attr('data-api-url');

    const channel_url = `https://aijishu.com/${api_path}?page=1`;
    const channel_url_resp = await got(channel_url);
    const resp = channel_url_resp.data;
    const list = resp.data.rows;

    const items = await Promise.all(list.map((item) => utils.parseArticle(item, ctx)));
    ctx.state.data = {
        title: title.split(' - ').slice(0, 2).join(' - '),
        link: channel_url,
        item: items,
    };
};
