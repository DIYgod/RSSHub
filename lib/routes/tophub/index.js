const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const threshold = ctx.params.threshold ? ctx.params.threshold : 0;

    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.Xc-ec-L.b-L').text().trim();
    const regex = /[\d.]+\s*万.*/gm;

    const out = await Promise.all(
        $('div.Zd-p-Sc > div:nth-child(1) tr')
            .filter(function () {
                const hotness_text = $(this).children('td:nth-child(3)').text();
                const hotness = parseFloat(hotness_text);
                return (isNaN(hotness) || hotness > threshold) && regex.exec(hotness_text) !== null;
            })
            .map(async function () {
                const hotness_text = $(this).children('td:nth-child(3)').text();

                const itemLink = $(this).find('td.al a').attr('href');
                const res = await got.get(`https://tophub.today${itemLink}`);

                const info = {
                    title: $(this).find('td.al a').text() + ` (${hotness_text})`,
                    link: res.redirectUrls[0],
                };
                return info;
            })
            .get()
    );

    ctx.state.data = {
        title: title,
        link: link,
        item: out,
    };
};
