const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const queryParams = ctx.request.querystring;
    const queryUrl = `https://${ctx.params.location}.craigslist.org/search/${ctx.params.type}?${queryParams}`;
    const { data } = await got.get(queryUrl);
    const $ = cheerio.load(data);
    const items = $('.result-row')
        .slice(0, 20)
        .map((_, _item) => {
            const item = $(_item);
            const info = item.find('.result-info').first();
            const titleNode = info.find('.result-title').first();
            const price = info.find('.result-price').first().text();
            const hood = info.find('.result-hood').first().text();
            const date = info.find('time').first().attr('datetime');

            const dataIds = item.find('.result-image').first().attr('data-ids');
            let desc = '';
            if (dataIds) {
                const imageList = dataIds.split(',').map((id) => `<img src="https://images.craigslist.org/${id.split(':')[1]}_1200x900.jpg"/>`);
                desc = imageList.join('');
            }
            return {
                title: price + ' - ' + titleNode.text() + hood,
                link: titleNode.attr('href'),
                description: desc,
                pubDate: date,
                guid: titleNode.attr('id'),
            };
        })
        .get();
    const urlParams = new URLSearchParams(queryParams);
    let itemName = urlParams.get('query');
    if (!itemName) {
        itemName = '';
    } else {
        itemName = itemName.replace('+', ' ');
    }
    ctx.state.data = {
        title: itemName + ' - Craigslist',
        link: queryUrl,
        item: items,
    };
};
