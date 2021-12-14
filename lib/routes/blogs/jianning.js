const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const url = require('url');

module.exports = async (ctx) => {
    const base_url = `http://jian-ning.com/all-articles.html`;
    const response = await got({
        method: 'get',
        url: base_url,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(data);
    const list = $('li');
    const out = list
        .map(async (i, item) => {
            const link = url.resolve('http://jian-ning.com', $(item).find('a').attr('href'));
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got({
                    method: 'get',
                    url: link,
                    responseType: 'buffer',
                    headers: {
                        Referer: base_url,
                    },
                });
                const content = cheerio.load(iconv.decode(result.data, 'gbk'));
                return content('td td').html();
            });
            const post = {
                title: $(item).find('a').text(),
                link,
                pubDate: $(item).find('span').text(),
                description,
            };
            return post;
        })
        .get();
    ctx.state.data = {
        title: $('head > title').text(),
        link: base_url,
        item: await Promise.all(out),
    };
};
