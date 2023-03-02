const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const response = await got(rootUrl + '/changelog');
    const $ = cheerio.load(response.data);
    const items = $('div[class^=changelog-entry]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                link: rootUrl + item.find('a').attr('href'),
                description: item.find('div[class^=content-docs]').html(),
                pubDate: parseDate(item.find('a[class*=mb-xx-small]').text()),
                author: item
                    .find('span[class^=flex-shrink-0]')
                    .eq(0)
                    .find('img')
                    .toArray()
                    .map((e) => $(e).attr('alt').replace('Avatar of ', ''))
                    .join(', '),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl + '/changelog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    };
};
