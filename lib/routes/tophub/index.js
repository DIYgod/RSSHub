const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.Xc-ec-L.b-L').text().trim();

    const out = $('div.Zd-p-Sc > div:nth-child(1) tr')
        .map(function () {
            const info = {
                title: $(this).find('td.al a').text(),
                link: $(this).find('td.al a').attr('href'),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: link,
        item: out,
    };
};
