const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://35photo.pro';

module.exports = {
    rootUrl,
    ProcessItems: async (currentUrl, apiUrl) => {
        let $, response;

        response = await got({
            method: 'get',
            url: currentUrl,
        });

        const data = response.data;

        $ = cheerio.load(data);

        const title = $('h1').text();

        if (apiUrl) {
            response = await got({
                method: 'get',
                url: `${apiUrl}&lastId=${$('div.countLike').last().attr('photo-id')}`,
            });

            $ = cheerio.load(data + response.data.data);
        }

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
            title: `${title} - 35PHOTO`,
            link: currentUrl,
            item: items,
        };
    },
};
