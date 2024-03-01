const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.nikkei.com';
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const list = $('a[data-rn-inview-track-value]')
        .toArray()
        .map((e) => {
            e = $(e);
            const data = e.data('rn-track-value');
            const title = data.title;
            const link = `${url}/article/${data.kiji_id_raw}/`;

            const parent = e.parent();
            const img = parent.find('img[class^=image_]');
            const imgSrc = img.attr('src');
            const imgAlt = img.attr('alt');

            const desc = `<img src="${imgSrc}" alt="${imgAlt}">` + (parent.find('[class^=excerptContainer]').length ? parent.find('[class^=excerptContainer]').html() : '');

            return {
                title,
                description: desc,
                link,
            };
        });

    ctx.state.data = {
        title: '日本経済新聞',
        link: url,
        item: list,
    };
};
