const { getData, getList } = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://grist.org/';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const listItems = $('li.hp-featured__tease')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('.small-tease__link').attr('href').split('/').slice(-2, -1)[0];
            return {
                link,
            };
        });
    const itemData = await Promise.all(listItems.map((item) => ctx.cache.tryGet(item.link, async () => (await getData(`https://grist.org/wp-json/wp/v2/posts?slug='${item.link}'&_embed`))[0])));
    const items = await getList(itemData);

    ctx.state.data = {
        title: 'Gist Featured Articles',
        link: baseUrl,
        item: items,
        description: 'Featured Articles on Grist.org',
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
};
