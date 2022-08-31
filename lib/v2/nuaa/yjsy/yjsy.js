const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://www.graduate.nuaa.edu.cn/';
const { parseDate } = require('@/utils/parse-date');

const map = {
    latest: '2146/list.htm',
    yyxw: 'yyxw/list.htm',
    sjwj: 'sjwj/list.htm',
    glwj: '2017/list.htm',
    xxfw: '2147/list.htm',
};

const load = (link, ctx) =>
    ctx.cache.tryGet(link, async () => {
        const response = await got(host + link);
        const $ = cheerio.load(response.data);
        const images = $('img');
        for (let k = 0; k < images.length; k++) {
            $(images[k]).replaceWith(`<img src="${new URL($(images[k]).attr('src'), host).href}" />`);
        }
        const description = $('.wp_articlecontent').html();
        return { description };
    });

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'latest';
    const response = await got({
        method: 'get',
        url: host + map[type],
    });
    const $ = cheerio.load(response.data);
    const list = $('#news_list ul.news_ul > li').slice(0, 10).get();
    const process = await Promise.all(
        list.map(async (item) => {
            const a = $(item).find('a');
            const t = $(item).find('span');
            const itemUrl = a.attr('href');
            const single = {
                title: a.text(),
                link: new URL(itemUrl, host).href,
                pubDate: parseDate(t.text(), 'YYYY-MM-DD'),
            };
            const other = await load(itemUrl, ctx);
            return { ...single, ...other };
        })
    );

    ctx.state.data = {
        title: '南航研究生院',
        link: host,
        description: '南航研究生院RSS',
        item: process,
    };
};
