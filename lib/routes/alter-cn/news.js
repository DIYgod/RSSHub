const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'http://alter-shanghai.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: url.resolve(root_url, '/cn/news.html'),
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.listnews li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const m = /(\d{4}-\d+-\d+)/.exec(item.find('span').text());
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: m && new Date(m[1] + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet('alter-cn' + item.link, async () => {
                    const res = await got({ method: 'get', url: url.resolve(root_url, item.link) });
                    const content = cheerio.load(res.data);
                    item.description = content(content('div.con table.table3')[1]).html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'Alter Shanghai',
        link: root_url,
        item: items,
    };
};
