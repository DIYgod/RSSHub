const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://www.latexstudio.net/',
    });
    const $ = cheerio.load(res.data);
    const list = $('div.article-latest').find('div.item');

    const ProcessFeed = async (link) => {
        const detail = await got({
            method: 'get',
            url: link,
        });
        const $ = cheerio.load(detail.data);
        $('.tac').remove();
        const author = $('.article-meta .item:last-child').text().replace('稿源：', '');
        const description = $('.article-content').html();
        return { description, author };
    };

    const items = await Promise.all(
        list
            .slice(0, 10)
            .map(async (index, item) => {
                const $item = $(item);
                const originalUrl = $item.find('h2').find('a').attr('href').replace('http', 'https');

                const cache = await ctx.cache.get(originalUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const { description, author } = await ProcessFeed(originalUrl);

                const single = {
                    title: `${$item.find('a.cat').text().trim()} - ${$item.find('h2', 'a').text()}`,
                    link: originalUrl,
                    description,
                    author,
                };
                ctx.cache.set(originalUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: 'LaTeX 开源小屋',
        link: 'http://www.latexstudio.net/',
        item: items,
    };
};
