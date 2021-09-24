const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const { BASE_URL } = utils;

module.exports = async (ctx) => {
    const res = await got.get('https://www.icac.org.hk/tc/press/index.html');
    const $ = cheerio.load(res.data);

    const news = $('.pressItem.clearfix')
        .map((i, e) => {
            const c = cheerio.load(e);
            const r = {
                title: c('.hd a').text().trim(),
                description: c('.details p').text().trim(),
                pubDate: c('.date').text().trim(),
                thumb: c('.thumb img').attr('src'),
                link: c('.hd a').attr('href'),
            };
            return r;
        })
        .get();

    ctx.state.data = {
        title: 'ICAC 新闻公布',
        link: 'https://www.icac.org.hk/tc/press/index.html',
        description: 'ICAC 新闻公布',
        item: news.map((e) => ({
            title: e.title,
            pubDate: e.pubDate,
            link: `${BASE_URL}${e.link}`,
            description: utils.renderDesc(e.description, e.thumb),
        })),
    };
};
