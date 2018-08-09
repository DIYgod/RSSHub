const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://www.oschina.net/news/',
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://www.oschina.net/news/',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('#newsList').find('.news-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const url = `https://www.oschina.net${each.find('a', 'h3').attr('href')}`;
            const item = {
                title: each.find('a', 'h3').attr('title'),
                description: '',
                link: url,
            };
            const key = 'oschina' + url;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const detail = await axios({
                    method: 'get',
                    url: url,
                    headers: {
                        'User-Agent': config.ua,
                        Referer: url,
                    },
                });
                const content = cheerio.load(detail.data);
                item.description = content('#articleContent').html();
                ctx.cache.set(key, item.description, 24 * 60 * 60);
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
