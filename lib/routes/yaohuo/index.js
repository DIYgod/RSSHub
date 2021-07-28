const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.type = ctx.params.type || 'new';

    const rootUrl = `https://yaohuo.me`;
    const currentUrl = `${rootUrl}/bbs/book_list.aspx?action=${ctx.params.type}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.line1, div.line2')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a').eq(0);
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                author: item.text().split('/')[0].split(a.text())[1],
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: list,
    };
};
