const { get_html, get_elements } = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let { perPage = '50' } = ctx.params;
    perPage = parseInt(perPage);
    // perPage has to be one of 20, 50, 100
    if (perPage <= 35) {perPage = 20;}
    if (35 < perPage && perPage <= 70) {perPage = 50;}
    if (70 < perPage) {perPage = 100;}

    // Get title and link
    url = `https://www.nber.org/papers?page=1&perPage=${perPage}&sortBy=public_date`;
    const html = await get_html(url);
    const elements = await get_elements(html, '.digest-card .digest-card__title a');

    // Get Author and Abstarct
    const baseUrl = 'https://www.nber.org';
    const items = await Promise.all(
        elements.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${baseUrl}${item.link}`,
                });
                const content = cheerio.load(detailResponse.data);
                const authors = [];
                content('.page-header__author-item a').each((index, element) => {
                    const text = content(element).text();
                    const link = content(element).attr('href');
                    authors.push({ name: text, link });
                });
                item.authors = authors;
                item.abstract = content('.page-header__intro-inner p').text();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'NBER Working Paper',
        link: url,
        item: items,
        description: `National Bureau of Economic Research Working Papers -- ${perPage} articles`,
    };
};
