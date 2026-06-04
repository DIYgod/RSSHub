const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://anytxt.net';
    const currentUrl = `${rootUrl}/download`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.has-medium-font-size')
        .map((_, item) => {
            item = $(item);
            const date = item.text().replace(':', '');

            return {
                title: date,
                link: currentUrl,
                pubDate: new Date(date).toUTCString(),
                description: `<ol>${item.next().html()}</ol>`,
            };
        })
        .get();

    ctx.state.data = {
        title: 'Release Notes - AnyTXT',
        link: currentUrl,
        item: items,
    };
};
