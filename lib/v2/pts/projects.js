const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}/projects`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('h3 a')
        .toArray()
        .map((item) => {
            item = $(item);

            const projectDiv = item.parent().parent();
            const description = projectDiv.find('p').text();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(projectDiv.find('time').text()),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: projectDiv.parent().find('.cover-fit')?.attr('src') ?? projectDiv.parent().parent().find('.cover-fit').attr('src'),
                    description: description ? `<p>${description}</p>` : '',
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
