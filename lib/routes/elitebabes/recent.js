const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.elitebabes.com`,
        headers: {
            Referer: `https://www.elitebabes.com`,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div#root .gallery-a').children('li');
    ctx.state.data = {
        title: 'elitebabes',
        link: 'https://www.elitebabes.com',

        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = item.find('img').attr('src');
                    return {
                        title: item.index(),
                        description: `<img src="${itemPicUrl}"/>`,
                        link: 'https://www.elitebabes.com',
                    };
                })
                .get(),
    };
};
