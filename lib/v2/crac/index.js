const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.crac.org.cn';
    const type = ctx.params.type;
    const link = type ? `${baseUrl}/News/List?type=${type}` : `${baseUrl}/News/List`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.InCont_r_d_cont > li')
        .map((_, item) => {
            item = $(item);
            return {
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
                item.title = content('div.r_d_cont_title > h3').text();
                item.description = content('div.r_d_cont').html().trim().replace(/\n/g, '');
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
