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

    const items = $('.elementor-widget-container .elementor-text-editor')
        .map((_, item) => {
            item = $(item);
            const title = item.find('h3, h4').eq(0);
            const image = item.parentsUntil('.elementor-container').find('.elementor-image img');
            const firstLink = item.find('a.button').eq(0);

            let links = '';
            item.find('a.button').each(function () {
                links += `<br><a href="${$(this).attr('href')}">${$(this).text()}</a>`;
            });

            return {
                link: firstLink.attr('href'),
                title: title.text() || firstLink.text(),
                description: `${image ? `<img src="${image.attr('src')}"><br>` : ''}${title.next().html() ? title.next().html() : ''}${links}`,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
