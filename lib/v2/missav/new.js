const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://missav.com';
    const { data: response } = await got(`${baseUrl}/dm397/new`);
    const $ = cheerio.load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.text-secondary');
            const poster = new URL(item.find('img').data('src'));
            poster.searchParams.set('class', 'normal');
            const video = item.find('video').data('src');
            return {
                title: title.text().trim(),
                link: title.attr('href'),
                description: art(join(__dirname, 'templates/preview.art'), {
                    poster: poster.href,
                    video,
                    type: video.split('.').pop(),
                }),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
};
