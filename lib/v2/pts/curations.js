const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}/curations`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.project-intro')
        .last()
        .find('h3 a')
        .toArray()
        .map((item) => {
            item = $(item);

            const projectDiv = item.parent().parent();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(projectDiv.find('time').text()),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: projectDiv.parent().find('.cover-fit').attr('src'),
                }),
            };
        });

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/第\d+頁 ｜ /, ''),
        link: currentUrl,
        item: items,
    };
};
