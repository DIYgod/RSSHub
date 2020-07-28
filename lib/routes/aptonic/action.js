const got = require('@/utils/got');
const url = require('url');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://aptonic.com/actions/`;

    const res = await got.get(link);
    const $ = cheerio.load(res.body);

    ctx.state.data = {
        title: 'Dropzone Actions',
        link,
        item: $('table.actions >> tr')
            .get()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('h2').text(),
                    description: `
          <img src="${url.resolve(link, item.find('img').attr('src'))}"/>
          <br/>
          ${$(item.find('td')[1]).children().remove().end().text()}
        `,
                    pubDate: new Date().toUTCString(),
                    link: url.resolve(link, item.find('td.icon a').attr('href')),
                };
            }),
    };
};
