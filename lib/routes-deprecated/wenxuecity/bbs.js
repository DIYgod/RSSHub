const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const elite = ctx.params.elite === undefined ? 0 : ctx.params.elite;
    const base_url = `https://bbs.wenxuecity.com/${ctx.params.cat}/?elite=${elite}`;
    const response = await got(base_url);
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.odd,div.even');
    const out = list
        .slice(0, 10)
        .map(async (i, item) => {
            const link = url.resolve(base_url, $(item).find('a.post').attr('href'));
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got(link, {
                    headers: {
                        Referer: base_url,
                    },
                });
                const content = cheerio.load(result.data);
                return content('div#content').html();
            });
            const post = {
                title: $(item).find('a.post').text(),
                link,
                author: $(item).find('span.b > a.b').text(),
                description,
            };
            return post;
        })
        .get();
    ctx.state.data = {
        allowEmpty: true,
        title: $('title').text(),
        link: base_url,
        item: await Promise.all(out),
    };
};
