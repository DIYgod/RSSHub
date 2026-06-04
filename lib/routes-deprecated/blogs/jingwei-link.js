const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://jingwei.link/';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $("article[class='article-item']")
        .map((index, elem) => {
            elem = $(elem);

            const $esction = elem.find('section[class="post-preview"]');

            return {
                title: $esction.find('h2').text(),
                description: $esction.find('h3').text(),
                link: $esction.find('a').attr('href'),
                author: '敬维',
            };
        })
        .get();

    ctx.state.data = {
        title: '敬维-以认真的态度做完美的事情',
        link: url,
        item: resultItem,
    };
};
