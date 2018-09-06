const axios = require('../../../utils/axios');
const url = require('url');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://de.chineseembassy.org/chn/lsfw/jqtz/';

    const res = await axios.get(link);
    const $ = cheerio.load(res.data);

    const list = $('#docNum a')
        .slice(0, 5)
        .map((i, e) => ({
            link: url.resolve(link, $(e).attr('href')),
            title: $(e).text(),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(item.link);
            const $ = cheerio.load(response.data);
            const single = {
                title: item.title,
                link: item.link,
                description: $('#article > table > tbody > tr:nth-child(10) > td > div').html(),
                pubDate: new Date($('#article > table > tbody > tr:nth-child(6) > td').text()).toUTCString(),
            };
            ctx.cache.set(item.link, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国驻德国大使馆-- 重要通知',
        description: '中国驻德国大使馆 -- 重要通知',
        link,
        item: out,
    };
};
