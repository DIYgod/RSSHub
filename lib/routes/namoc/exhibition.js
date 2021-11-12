const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const logger = require('@/utils/logger');

const host = 'http://www.namoc.org/zsjs/zlzx/';

module.exports = async (ctx) => {
    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('#content div.rec-exh-news-list div.wrap:nth-of-type(2)').find('li').get();
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
        const full = $('#content');

        let info = full.find('ul.info');
        info = $(info).remove('.fav_btn');

        const from = $(info).find('script:first-of-type').html().replace('getExhDate("', '').replace('");', '');
        const to = $(info).find('script:last-of-type').html().replace('getExhDate("', '').replace('");', '');

        $(info).find('script:first-of-type').replaceWith(from);
        $(info).find('script:last-of-type').replaceWith(to);

        const intro = full.find('div.Custom_UnionStyle').html();
        const cover = full.find('p.image-list').html();
        out[i].description = cover + info + intro;
        out[i].author = full.find('.news-info span:first-of-type').text().replace('来源：', '');
        out[i].pubDate = new Date(full.find('.news-info span:last-of-type').text().replace('时间：', '')).toUTCString();
        ctx.cache.set(out[i].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '中国美术馆 -- 展览预告',
        link: host,
        item: out,
    };
};
