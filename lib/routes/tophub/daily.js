const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = `https://tophub.today/daily`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.Xc-ec-L.b-L').text().trim();

    const out = $('div.cc-dc > div:kt-t__item-text')
        .map(function () {
            const info = {
                title: $(this).find('kt-t__item-text a').text(),
                link: $(this).find('kt-t__item-text a').attr('href'),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
