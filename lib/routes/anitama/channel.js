const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.anitama.cn';
    const url = 'http://www.anitama.cn/channel/' + (ctx.params.channel ? ctx.params.channel : '');

    const response = await axios({
        method: 'get',
        url: url,
    });

    const $ = cheerio.load(response.data);
    const channel_name = $('#area-article-channel .bar')
        .text()
        .slice(0, -5);
    const list = $('#area-article-channel div.inner a')
        .slice(0, 10)
        .map((i, e) => ({
            link: baseUrl + $(e).attr('href'),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const { link } = item;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(link);

            const $ = cheerio.load(response.data);
            const single = {
                pubDate: $('.time').text(),
                author: $('.author').text(),
                link: link,
                title: $('h1').text() + '-' + $('h2').text(),
                description: $('#area-content-article').text(),
            };

            ctx.cache.set(link, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Anitama-' + channel_name,
        link: url,
        description: 'Anitama-' + channel_name,
        item: out,
    };
};
