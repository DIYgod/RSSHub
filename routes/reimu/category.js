const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');
const util = require('./util');

module.exports = async (ctx) => {
    let category = ctx.params.category;
    const categoryType = ['3d', 'anime', 'collection', 'picture', 'wallpaper', 'chinese', 'game', 'comic', 'indie', 'recommend', 'music'];

    if (categoryType.indexOf(category) === -1) {
        category = categoryType[0];
    }

    const url = `https://blog.reimu.net/archives/category/${category}`;

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

    const articles = $('article');
    const title = $('title').text();

    ctx.state.data = {
        title: title,
        link: url,
        description: title,
        item: util.getArticleData(articles, $),
    };
};
