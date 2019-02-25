const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const response = await axios.get('https://api.dongqiudi.com/app/tabs/iphone/1.json?mark=gif&version=576');
    const data = response.data.articles;

    const proList = [];

    const out = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const itemUrl = item.share;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title,
                link: itemUrl,
            };

            const es = axios.get(itemUrl);
            proList.push(es);
            return Promise.resolve(single);
        })
    );

    const responses = await axios.all(proList);
    for (let i = 0; i < proList.length; i++) {
        const $ = utils.ProcessVideo(cheerio.load(responses[i].data));
        const full = $('div.detail');

        out[i].description = utils.ProcessHref(full.find('div:nth-of-type(1)')).html();
        out[i].author = full.find('span.name').text();
        out[i].pubDate = date(
            full
                .find('span.time')
                .text()
                .trim(),
            8
        );
    }
    ctx.state.data = {
        title: '懂球帝头条新闻',
        link: 'http://dongqiudi.com/',
        item: out.filter((e) => e !== undefined),
    };
};
