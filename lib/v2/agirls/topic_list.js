const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://agirls.aotter.net';
    const category = 'topic';

    const response = await got({
        url: baseUrl + '/' + category,
        header: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const items = $('div div.border-b.border-neutral-lighter')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h2').text().trim(),
                description: item.find('a').attr('href').replace('/topic/', ''),
                link: baseUrl + item.find('a').attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };

    ctx.state.json = {
        title: $('head title').text().trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };
};
