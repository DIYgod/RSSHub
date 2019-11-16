const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const root_url = 'http://www.3ycy.com';
    const response = await got({
        method: 'get',
        url: root_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.postList div.postItem');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); ++i) {
        count.push(i);
    }

    const items = await Promise.all(
        count.map(async (i) => {
            const item = $(list[i]);
            const title = item.find('h3 a').first();
            const link = title.attr('href');

            const res = await got({ method: 'get', url: url.resolve(root_url, link) });
            const content = cheerio.load(res.data);

            return await ctx.cache.tryGet('3ycy' + link, () => ({
                title: title.text(),
                link: link,
                description: content('div.postBody').html(),
            }));
        })
    );

    ctx.state.data = {
        title: '三界异次元',
        link: root_url,
        item: items,
    };
};
