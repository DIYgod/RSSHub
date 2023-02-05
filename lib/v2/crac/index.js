const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.crac.org.cn/News/List';
    const type = ctx.params.type;
    const link = type ? `${baseUrl}?type=${type}` : baseUrl;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.InCont_r_d_cont > li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('span.cont_d').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(response.data);
                item.description = content('div.r_d_cont').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link,
        item: list,
    };
};
