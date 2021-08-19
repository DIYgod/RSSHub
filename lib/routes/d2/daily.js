const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const indexLink = 'https://daily.fairyever.com/';
    const { data } = await got.get(indexLink);

    const $ = cheerio.load(data);
    // 修改 slice 可以获取更多天的内容，暂时最新的一天就够了
    const days = $('.sidebar-link:contains(年)').slice(0, 1).toArray();

    const items = await Promise.all(
        days.map(async (ele) => {
            ele = $(ele);
            const relativePath = ele.attr('href');
            const link = url.resolve(indexLink, relativePath);
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(cache);
            }
            const { data } = await got.get(link);
            const $$ = cheerio.load(data);
            // 去除锚点
            $$('a')
                .filter(() => $(this).text() === '#')
                .remove();
            const description = $$('.theme-default-content').html();

            const item = {
                title: ele.text() + ' | D2 日报',
                pubDate: date(ele.text().replace(/ /g, '')),
                description,
                guid: link,
                link,
            };
            ctx.cache.set(link, cache);
            return item;
        })
    );

    ctx.state.data = {
        title: '日报 | D2 资源库',
        link: 'https://awesome.fairyever.com/daily/',
        description: '日报 | D2 资源库',
        item: items,
    };
};
