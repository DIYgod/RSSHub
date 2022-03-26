const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.anitama.cn';
    const url = 'http://www.anitama.cn/channel/' + (ctx.params.channel ? ctx.params.channel : '');

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const channel_name = $('#area-article-channel .bar').text().slice(0, -5);
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

            const response = await got.get(link);

            const $ = cheerio.load(response.data);
            const content = $('#area-content-article');
            content.find('img').each((index, item) => {
                item = $(item);
                item.attr('src', item.attr('data-src'));
            });
            content.find('a').each((index, item) => {
                if (item.attribs.href.startsWith('#')) {
                    item.tagName = 'span';
                }
            });
            const single = {
                pubDate: date($('.time').text()),
                author: $('.author').text(),
                link,
                title: $('h1').text() + '-' + $('h2').text(),
                description: content.html(),
            };

            ctx.cache.set(link, JSON.stringify(single));
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
