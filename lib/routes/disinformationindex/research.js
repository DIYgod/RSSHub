const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://disinformationindex.org';
    const currentUrl = `${rootUrl}/research`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('section.elementor-element')
        .map((_, item) => {
            item = $(item);
            const title = item.find('h4');

            return {
                title: title.text(),
                link: item.find('a.button').eq(0).attr('href'),
                description: `<img src="${item.find('.elementor-image img').attr('src')}"><p>${title.next().html()}</p>`,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
