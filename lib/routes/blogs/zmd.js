const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://zmd.hedwig.pub';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('div[class="StyledBox-sc-13pk1d4-0 heWGCm"]')
        .next()
        .map((i, e) => {
            const element = $(e);
            const title = element
                .find('a')
                .find('h3')
                .text();
            // const description = element.find('span[class="StyledText-sc-1sadyjn-0 cytSyP"]').text();
            const link = url + element.find('a').attr('href');
            const pubDate = element.find('span[class="StyledText-sc-1sadyjn-0 cgWXqc"]').text();

            return {
                title: title,
                description: '',
                link: link,
                author: 'Hedwig',
                pubDate: pubDate,
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
            itemElement('.StyledBox-sc-13pk1d4-0 .bpdfin')
                .find('h1[class="StyledHeading-sc-1rdh4aw-0 kIYNxP"]')
                .remove();
            item.description = itemElement('.StyledBox-sc-13pk1d4-0 .bpdfin').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '我有一片芝麻地',
        description: '搜集一些有关编程与设计的芝麻, 没什么观点. 顶多周更, 至少月更.',
        link: url,
        item: result,
    };
};
