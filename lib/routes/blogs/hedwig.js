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
    const title = $('div[class="Box-e7t7cp-0 Box__Flex-e7t7cp-1 iCGycx"]').find('h1').text();

    const list = $('div[class="Issue__IssueSummaryWrap-sc-1x68y3v-2 imATNn"]')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').find('h2').text();
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
            item.description = itemElement('div[class="urlFriendlyName__BlocksContainer-u4deoq-3 gpGWtc"]').html();

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
