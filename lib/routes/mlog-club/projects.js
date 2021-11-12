const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://mlog.club/projects';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.projects .project')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('.project-header a');
            const $summary = elem.find('.summary');

            return {
                title: $link.text(),
                description: $summary.text(),
                link: $link.attr('href'),
                author: '码农俱乐部',
            };
        })
        .get();

    const title = $('title').text();

    ctx.state.data = {
        title,
        link: url,
        item: resultItem,
    };
};
