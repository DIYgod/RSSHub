const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

module.exports = async (ctx) => {
    const forum = ctx.params.forum;
    const link = forum ? `https://www.luogu.com.cn/discuss/lists?forumname=${forum}` : 'https://www.luogu.com.cn/discuss/lists';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('title').text();

    const out = $('.lg-table-row .am-u-md-6')
        .map(function () {
            const a = $(this).find('a').first();
            const s = $(this).find('span.lg-small');
            return {
                title: a.text(),
                link: resolve_url('https://www.luogu.com.cn', a.attr('href')),
                pubDate: new Date(s.text().split('\n')[2].trim().substr(1) + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
