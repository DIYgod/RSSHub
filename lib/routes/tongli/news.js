const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseURL = 'https://www.tongli.com.tw/';
    const link = `${baseURL}TNews_List.aspx?Type=${type}&Page=1`;
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    const title = $('entry_title .n1').text();
    const _list = $('.news_list ul li')
        .map(function () {
            let link = $(this).find('.title a').attr('href');
            /^https?:\/\//.test(link) || (link = baseURL + link);
            return {
                title: $(this).find('.title a').text(),
                link,
                pubDate: new Date($(this).find('.date').text()),
            };
        })
        .get();
    const list = await Promise.all(
        _list.map(async (item) => {
            const { title, link, pubDate } = item;
            const description = await ctx.cache.tryGet(link, async () => {
                const res = await got.get(link);
                const $ = cheerio.load(res.data);
                if (/^https:\/\/tonglinv\.pixnet\.net/.test(link)) {
                    return $('.article-content-inner').html();
                } else if (/^https?:\/\/blog\.xuite\.net\//.test(link)) {
                    return $('#content_all').html();
                } else if (/TNews_View\.aspx/.test(link)) {
                    return $('#ContentPlaceHolder1_TNewsContent').html();
                } else {
                    return '';
                }
            });
            return Promise.resolve({ title, link, description, pubDate });
        })
    );
    ctx.state.data = {
        title,
        link,
        item: list,
    };
};
