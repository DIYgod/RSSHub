const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://35photo.pro';

module.exports = {
    rootUrl,
    ProcessItems: async (currentUrl) => {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        const items = $('.item')
            .toArray()
            .map((item) => {
                item = $(item);

                const image = item.find('.showPrevPhoto');

                return {
                    title: image.attr('title').replace(/Photographer\\'s photo - /, ''),
                    link: image.parent().attr('href'),
                    author: item.next().find('.userName').text().replace(/© /, ''),
                    category: image
                        .attr('alt')
                        .replace(/photo preview/g, '')
                        .split(/,|#/)
                        .map((c) => c.trim()),
                    description: `<img src="${rootUrl}/photos_main/${image.attr('src').match(/sizes\/(.*)_/)[1]}.jpg">`,
                };
            });

        return {
            title: `${$('h1').text()} - 35PHOTO`,
            link: currentUrl,
            item: items,
        };
    },
};
