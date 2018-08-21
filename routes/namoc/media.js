const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.namoc.org/xwzx/mtry/2018/';

module.exports = async (ctx) => {
    const response = await axios.get(host);

    const $ = cheerio.load(response.data);

    const list = $('.news-list li:not(.clearfix)');
    const out = [];
    const proList = [];

    for (let i = 0; i < Math.min(list.length, 5); i++) {
        const $ = cheerio.load(list[i]);
        const title = $('a').text();
        const itemUrl = url.resolve(host, $('a').attr('href'));
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }
        const single = {
            title,
            link: itemUrl,
            guid: itemUrl,
        };

        try {
            const es = axios.get(itemUrl);
            proList.push(es);
            out.push(single);
        } catch (err) {
            console.log(`${title}: ${itemUrl} -- ${err.response.status}: ${err.response.statusText}`);
        }
    }

    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);
        const full = $('#content');

        const link = out[i].link.split('/');
        link.pop();
        const absLink = link.join('/');

        out[i].description = full
            .find('div.TRS_Editor')
            .html()
            .replace(/src="./g, `src="${absLink}`);
        out[i].author = full
            .find('.news-info span:first-of-type')
            .text()
            .replace('来源：', '');
        out[i].pubDate = new Date(
            full
                .find('.news-info span:last-of-type')
                .text()
                .replace('时间：', '')
        ).toUTCString();
        ctx.cache.set(out[i].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: '中国美术馆 -- 媒体联报',
        link: host,
        item: out,
    };
};
