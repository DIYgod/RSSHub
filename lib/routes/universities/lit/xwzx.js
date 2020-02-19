const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.lit.edu.cn/';
const baseUrl = 'http://www.lit.edu.cn/xwzx/';
const nameProps = {
    ggtz: '公告通知',
    xwkx: '新闻快讯',
    xsxx: '学术信息',
    mtxw: '媒体新闻',
};

module.exports = async (ctx) => {
    const name = ctx.params.name || 'all';
    const urla = name === 'all' ? host : url.resolve(baseUrl, `${name}.htm`);
    const response = await got.get(urla);
    const $ = cheerio.load(response.data);
    $('.xxlibottom').remove();
    const list = name === 'all' ? $('.xxlcleft ul li').get() : $('li.list_item').get();

    const out = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = url.resolve(host, item.find('a').attr('href'));
            const single = {
                title: item.find('a').attr('title'),
                link: link,
            };

            const other = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);
                const $ = cheerio.load(result.data);
                const description = $('.nr_text').html();
                const pubDate = $('h6')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/);
                return {
                    description,
                    pubDate,
                };
            });

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: name === 'all' ? `新闻中心 - 洛阳理工学院` : `${nameProps[name]} - 洛理新闻中心`,
        link: urla,
        description: `洛阳理工学院新闻中心 RSS`,
        item: out,
    };
};
