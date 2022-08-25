const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://tophub.today`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const anchor = $(`[href='/n/${id}']`);
    const title = anchor.find(".cc-cd-lb > span").text().trim();

    const out = anchor.parents(".cc-cd").find(".cc-cd-cb-l > a")
        .map(function () {
            const info = {
                title: $(this).find('.t').text(),
                link: $(this).attr('href'),
            };
            return info;
        })
        .get();

    const link = `${url}/n/${id}`;
    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
