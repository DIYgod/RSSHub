const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `https://icity.ly/u/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const items = $('li.diary')
        .map((_, item) => {
            item = $(item);
            return {
                link: `https://icity.ly${item.find('a.timeago').attr('href')}`,
                title: item.prev('li.day-cut').text(),
                description: item.find('div.line').html(),
                pubDate: new Date(item.find('time.hours').attr('datetime')).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
        description: $('div.bio').text(),
    };
};
