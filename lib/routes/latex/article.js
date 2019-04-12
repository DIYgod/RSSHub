const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'http://www.latexstudio.net/',
        headers: {
            Referer: 'http://www.latexstudio.net/',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('div.article-latest').find('div.item');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }

    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each
                .find('h2')
                .find('a')
                .attr('href');
            const item = {
                title: each.find('h2', 'a').text(),
                description: each.find('p.note').text(),
                link: encodeURI(originalUrl),
            };

            const key = item.link;
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
                content('.tac').remove();
                item.description = content('.article-content').html();
                ctx.cache.set(key, item.description, 24 * 60 * 60);
            }
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'LaTeX 开源小屋',
        link: 'http://www.latexstudio.net/',
        item: resultItem,
    };
};
