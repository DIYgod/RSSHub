const { get_html, get_elements } = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.nber.org/papers?page=1&perPage=20&sortBy=public_date`;
    const html = await get_html(url);
    const elements = get_elements(html, '.digest-card.is-new .digest-card__title a');

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
        title: 'NBER Working Paper News',
        link: url,
        item: items,
        description: 'National Bureau of Economic Research Working Papers -- News',
    };
};
