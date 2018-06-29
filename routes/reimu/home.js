const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');
const util = require('./util');

module.exports = async (ctx) => {
    const url = 'https://blog.reimu.net';

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

    const articles = $('article').not('.sticky');
    const title = $('title').text();

    ctx.state.data = {
        title: title,
        link: url,
        description: title,
        item: util.getArticleData(articles, $),
    };
};
