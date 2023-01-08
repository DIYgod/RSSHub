const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://typora.io/releases/dev';
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const items = $('h2')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${currentUrl}#${item.text()}`,
                description: item
                    .nextUntil('h2')
                    .toArray()
                    .map((item) => $(item).html())
                    .join(''),
            };
        });

    ctx.state.data = {
        title: `Typora Changelog - Dev`,
        link: currentUrl,
        description: 'Typora Changelog',
        item: items,
    };
};
