const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.ddosi.org/category';
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    const category = ctx.params.category;
    const response = await got({
        method: 'get',
        url: `${url}/${category}/`,
        headers: {
            'User-Agent': userAgent,
            Referer: url,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('main>article').get();

    const items = list.map((i) => {
        const item = $(i);

        const href = item.find('a:first-child').attr('href');
        const title = item.find('.entry-title a').text();
        const description = item.find('.entry-content p').text();
        const date = item.find('.meta-date a time').attr('datetime');

        return {
            title: `${title}`,
            description: `${description}`,
            pubDate: date,
            link: `${href}`,
        };
    });

    ctx.state.data = {
        title: `雨苁-${category}`,
        link: `${url}/${category}/`,
        item: items,
    };
};
