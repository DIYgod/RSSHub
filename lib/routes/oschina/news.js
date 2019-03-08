const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://www.oschina.net/news/',
        headers: {
            Referer: 'https://www.oschina.net/news/',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('#newsList').find('.news-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each.find('a', 'h3').attr('href');
            const item = {
                title: each.find('a', 'h3').attr('title'),
                description: each.find('p', '.description').text(),
                link: encodeURI(originalUrl),
            };
            if (/^https:\/\/www.oschina.net\/news\/.*$/.test(originalUrl)) {
                const key = 'oschina' + item.link;
                const value = await ctx.cache.get(key);

                if (value) {
                    item.description = value;
                } else {
                    const detail = await axios({
                        method: 'get',
                        url: item.link,
                        headers: {
                            Referer: item.link,
                        },
                    });
                    const content = cheerio.load(detail.data);
                    content('.ad-wrap').remove();
                    item.description = content('#articleContent').html();
                    ctx.cache.set(key, item.description, 24 * 60 * 60);
                }
            }
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '开源中国-资讯',
        link: 'https://www.oschina.net/news/',
        item: resultItem,
    };
};
