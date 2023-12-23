const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://pkmer.cn';

module.exports = async (ctx) => {
    const { data: response } = await got(`${baseUrl}/page/1/`);
    const $ = cheerio.load(response);
    const items = process($);

    ctx.state.data = {
        title: 'PKMer',
        icon: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        logo: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        link: baseUrl,
        allowEmpty: true,
        item: items,
    };
};

function process($) {
    const container = $('#pages > div.grid > .relative');
    const items = container.toArray().map((el) => {
        el = $(el);
        const title = el.find('h3');
        return {
            title: title.text().trim(),
            link: baseUrl + title.parent().attr('href'),
            description: el.find('.leading-relaxed').prop('outerHTML') + el.find('.post-content').prop('outerHTML'),
            pubDate: el.find('time').attr('datetime'),
            author: el.find('h4').text().trim(),
            itunes_item_image: el.find('img').attr('src'),
        };
    });
    return items;
}
