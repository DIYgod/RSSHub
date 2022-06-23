const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl } = require('./utils');

module.exports = async (ctx) => {
    const response = await got(`${baseUrl}/siteindex`);
    const $ = cheerio.load(response.data);

    let items = $('li[class^="grid mq640-grid-12"]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('href').replace('/', ''),
                name: item.find('a').text(),
                link: baseUrl + item.find('a').attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(`nature:siteindex:${item.title}`, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                delete item.link;
                try {
                    item.id = $('.app-latest-issue-row__image img')
                        .attr('src')
                        .match(/.*\/journal\/(\d{5})/)[1];
                    item.description = item.id;
                } catch (e) {
                    //
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Nature siteindex',
        link: baseUrl + '/siteindex',
        item: items,
    };
    ctx.state.json = {
        items,
    };
};
