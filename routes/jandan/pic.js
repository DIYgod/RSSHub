const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

const base64_decode = (i) => Buffer.from(i, 'base64').toString('binary');

// jandan_decode is borrowed from jandan.net, which is used in function jandan_load_img.
const jandan_decode = (m) => base64_decode(m);
const baseUrl = 'http://jandan.net/';

module.exports = async (ctx) => {
    const sub_model = ctx.params.sub_model;

    const response = await axios({
        method: 'get',
        url: `${baseUrl}${sub_model}/`,
        headers: {
            'User-Agent': config.ua,
            Referer: 'http://jandan.net',
        },
    });

    const $ = cheerio.load(response.data);

    const items = Array();
    $('.commentlist > li').each((_, item) => {
        // Get current comment id, if comment_id is 'adsense', just need to skip..
        const comment_id = $(item).attr('id');
        if (comment_id === 'adsense') {
            return;
        }

        // Get current comment's link.
        const link = $(item)
            .find('.righttext')
            .find('a')
            .attr('href');
        if (link === undefined) {
            return;
        }

        // Get current comment's images.
        // TODO: should support multiple images.
        let img_url = $(item)
            .find('.text')
            .find('.img-hash')
            .html();
        if (img_url === null) {
            return;
        }
        img_url = jandan_decode(img_url);
        img_url = img_url.replace(/(\/\/\w+\.sinaimg\.cn\/)(\w+)(\/.+\.(gif|jpg|jpeg))/, '$1large$3');

        // TODO: should load user's comments.

        items.push({
            title: comment_id,
            description: `<img referrerpolicy="no-referrer"  src="http:${img_url}">`,
            link: `http:${link}`,
        });
    });

    let rss_title;
    let description;
    if (sub_model === 'pic') {
        rss_title = '煎蛋无聊图';
        description = '煎蛋官方无聊图，无限活力的热门图区。';
    } else if (sub_model === 'ooxx') {
        rss_title = '煎蛋妹子图';
        description = '这儿才是正版妹子图。';
    }

    ctx.state.data = {
        title: `${rss_title}`,
        link: `${baseUrl}${sub_model}/`,
        description: `${description}`,
        item: items,
    };
};
