const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const link = `http://www.mzitu.com/${id}`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const page_lengh = $('div.pagenavi > a:nth-last-child(2) > span').text();
    const title = $('h2.main-title').text();

    const pages = Array.from({ length: page_lengh }, (v, i) => i);

    ctx.state.data = {
        title,
        link,
        item: await Promise.all(
            pages.map(async (page) => {
                const page_link = link + '/' + (page + 1).toString();

                const response = await got({
                    method: 'get',
                    url: page_link,
                });
                const $ = cheerio.load(response.data);
                const item_link = $('div.main-image img').attr('src');
                const item_title = `${title} (${page + 1})`;
                const description = `<img src="${item_link}">`;
                return {
                    title: item_title,
                    link: page_link,
                    description,
                };
            })
        ),
    };
};
