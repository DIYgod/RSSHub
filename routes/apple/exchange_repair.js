const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.apple.com/';

module.exports = async (ctx) => {
    let link;

    if (!ctx.params.country) {
        ctx.params.country = 'cn';
    }

    ctx.params.country === 'us' ? (link = url.resolve(host, '/support/exchange_repair/')) : (link = url.resolve(host, `${ctx.params.country}/support/exchange_repair/`));

    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('tr td a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const datelist = $('tr td p')
        .map((i, e) =>
            $(e)
                .text()
                .trim()
        )
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl, index) => {
            itemUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: $('h1').text(),
                link: itemUrl,
                author: 'Apple Inc.',
                description: $('#welcome')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`),
                pubDate: new Date(datelist[index].replace(/(\d+) 年 (\d+) 月 (\d+) 日/, '$1-$2-$3')),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Apple 支持 -- 更换和维修扩展计划',
        link,
        item: out,
    };
};
