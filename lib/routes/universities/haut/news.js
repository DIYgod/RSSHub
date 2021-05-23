const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://www.haut.edu.cn/';

const map = {
    xxyw: 'xwzx/xxyw.htm',
    zhxx: 'xwzx/zhxx.htm',
    xsdt: 'xwzx/xsdt.htm',
    tzgg: 'xwzx/tzgg.htm',
    xngg: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1301',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = `${base_url}${map[type]}`;

    const response = await got({
        url: link,
        method: 'GET',
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: $('title').text(),
        link: link,
        item: $('.body_content .con_right .list_con div .list li')
            .map((_, elem) => ({
                title: $('a', elem).text(),
                link: resolve_url(link, $('a', elem).attr('href')),
                pubDate: new Date($('span', elem).text().split('：')[1]).toUTCString(),
            }))
            .get(),
    };
};
