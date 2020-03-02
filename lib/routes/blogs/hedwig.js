const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const url = 'https://' + `${type}` + '.hedwig.pub';
    const res = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(res.data);
    const title = $('div[class="StyledBox-sc-13pk1d4-0 heWGCm"]')
        .find('h1')
        .text();

    const list = $('div[class="StyledBox-sc-13pk1d4-0 czKiZd"]')
        .find('div[class="StyledBox-sc-13pk1d4-0 czKiZd"]')
        .find('div[class="StyledBox-sc-13pk1d4-0 czKiZd"]')
        .map((i, e) => {
            const element = $(e);
            const title = element
                .find('a')
                .find('h3')
                .text();
            const link = url + element.find('a').attr('href');
            return {
                title: title,
                description: '',
                link: link,
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            // Remove duplicate title
            itemElement('.StyledBox-sc-13pk1d4-0 .bpdfin')
                .find('h1[class="StyledHeading-sc-1rdh4aw-0 kIYNxP"]')
                .remove();
            item.description = itemElement('.StyledBox-sc-13pk1d4-0 .bpdfin').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'Ⓙ Hedwig - ' + title,
        link: 'https://' + `${type}` + '.hedwig.pub',
        item: result,
    };
};
