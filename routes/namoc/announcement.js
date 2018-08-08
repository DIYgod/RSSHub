const axios = require('../../utils/axios');
const config = require('../../config');
const cheerio = require('cheerio');
const url = require('url');

const _axios_client = axios.create({
    headers: {
        'User-Agent': config.ua,
    },
});

const host = 'http://www.namoc.org/xwzx/tzgg/2017gonggao/';

module.exports = async (ctx) => {
    const response = await _axios_client.get(host);

    const $ = cheerio.load(response.data);

    const list = $('.news-list li:not(.clearfix)').slice(0, 10);
    const out = [];
    const proList = [];

    for (let i = 0; i < list.length; i++) {
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
            const es = _axios_client.get(itemUrl);
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

        out[i].description = full.find('div.Custom_UnionStyle').html();
        out[i].author = '中国美术馆';
        out[i].pubDate = new Date(
            full
                .find('.news-info span:last-of-type')
                .text()
                .replace('时间：', '')
        ).toUTCString();
        ctx.cache.set(out[i].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: '中国美术馆 -- 通知公告',
        link: 'http://www.namoc.org/xwzx/tzgg/2017gonggao/',
        item: out,
    };
};
