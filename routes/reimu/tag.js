const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');
const util = require('./util');

module.exports = async (ctx) => {
    let tag = ctx.params.tag || 'ntr';

    const url = `https://blog.reimu.net/archives/tag/${tag}`;

    const response = await axios({
        method: 'get',
        url: encodeURI(url), // encode中文标签
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const articles = $('article');
    const title = $('title').text();

    ctx.state.data = {
        title: title,
        link: url,
        description: title,
        item: util.getArticleData(articles, $),
    };
};
