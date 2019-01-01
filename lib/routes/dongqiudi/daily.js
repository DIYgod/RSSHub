const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await axios.get('https://www.dongqiudi.com/special/48');

    const $ = cheerio.load(response.data);

    const host = 'https://www.dongqiudi.com';

    const list = $('.detail.special ul li h3')
        .slice(0, 10)
        .get();

    const proList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = host + $('a').attr('href');

            const single = {
                title,
                link: itemUrl,
            };

            try {
                const es = axios.get(itemUrl);
                proList.push(es);
                return Promise.resolve(single);
            } catch (err) {
                console.log(`${title}: ${itemUrl} -- ${err.response.status}: ${err.response.statusText}`);
            }
        })
    );

    const responses = await axios.all(proList);
    for (let i = 0; i < proList.length; i++) {
        const $ = utils.ProcessVideo(cheerio.load(responses[i].data));
        const full = $('div.detail');

        out[i].description = utils.ProcessHref(full.find('div:nth-of-type(1)')).html();
        out[i].author = full.find('span.name').text();
        out[i].pubDate = new Date(full.find('span.time').text()).toUTCString();
    }
    ctx.state.data = {
        title: '懂球帝早报',
        link: 'http://www.dongqiudi.com/special/48',
        item: out,
    };
};
