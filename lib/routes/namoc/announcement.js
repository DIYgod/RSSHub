const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const logger = require('@/utils/logger');

const host = 'http://www.namoc.org/xwzx/tzgg/2017gonggao/';

module.exports = async (ctx) => {
    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('.news-list li:not(.clearfix)').slice(0, 5).get();

    const proList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = url.resolve(host, $('a').attr('href'));
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
            };

            try {
                const es = got.get(itemUrl);
                proList.push(es);
                return Promise.resolve(single);
            } catch (err) {
                logger.error(`${title}: ${itemUrl} -- ${err.response.status}: ${err.response.statusText}`);
            }
        })
    );

    const responses = await got.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);
        const full = $('.content');

        const link = out[i].link.split('/');
        link.pop();
        const absLink = link.join('/');

        out[i].description = full
            .find('div.TRS_Editor')
            .html()
            .replace(/src="./g, `src="${absLink}`);
        out[i].author = '中国美术馆';
        out[i].pubDate = new Date(full.find('.news-info span:last-of-type').text().replace('时间：', '')).toUTCString();
        ctx.cache.set(out[i].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '中国美术馆 -- 通知公告',
        link: host,
        item: out,
    };
};
