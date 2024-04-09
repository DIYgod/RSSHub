const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://leemeng.tw/blog.html';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('article')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('[rel="bookmark"]');
            const title = $link.text();
            const link = $link.attr('href');

            return {
                title,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: 'LeeMeng - 部落格',
        link: url,
        item: resultItem,
    };
};
