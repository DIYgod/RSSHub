const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const baseUrl = 'https://www.mindmeister.com';

module.exports = async (ctx) => {
    const { category = 'mind-map-examples', language = 'en' } = ctx.params;
    const link = `${baseUrl}${language === 'en' || language === 'other' ? '' : `/${language}`}/${category === 'mind-map-examples' ? category : `mind-maps/${category}?language=${language}`}`;
    const respsonse = await got(link);

    const $ = cheerio.load(respsonse.data);

    const items = $('#public-listing .map-tile-wrapper')
        .toArray()
        .map((item) => {
            item = $(item);
            const imageUrl = new URL(
                item
                    .find('.map-wrapper')
                    .attr('style')
                    .match(/url\('(.*)'\);/)[1]
            ).href;

            return {
                title: item.find('.title').text(),
                description: art(path.join(__dirname, 'templates/image.art'), {
                    src: imageUrl.split('?')[0],
                    alt: item.find('.title').text().trim(),
                }),
                link: item.find('.title').attr('href'),
                author: item.find('.author').text().trim().replace(/^by/, ''),
                category: item.find('.fw-bold').text(),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name=description]').text(),
        link,
        item: items,
        language,
    };
};
