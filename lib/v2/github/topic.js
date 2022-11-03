const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://github.com/topics/${ctx.params.name}?${ctx.params.qs}`;
    const { data } = await got(link);
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: $('title').text(),
        link,
        item: $('article.my-4')
            .map((_, item) => {
                item = $(item);

                const title = $(item.find('h3 a').get(1)).attr('href').slice(1);
                const author = title.split('/')[0];
                const description = item.find('div.border-bottom > div > p + div').text();
                const link = `https://github.com/${title}`;

                return { title, author, description, link };
            })
            .get(),
    };
};
