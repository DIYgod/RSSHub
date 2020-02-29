const got = require('@/utils/got');
const cheerio = require('cheerio');

const map = new Map([
    [1, { id: 'hirasawayui', title: 'Hedwig-呆唯的Newsletter' }],
    [2, { id: 'se7en', title: 'Hedwig-0neSe7en的技术周刊' }],
    [3, { id: 'walnut', title: 'Hedwig-地心引力' }],
    [4, { id: 'themez', title: 'Hedwig-宪学宪卖' }],
    [5, { id: 'comeet', title: 'Hedwig-Comeet每周精选' }],
    [6, { id: 'zmd', title: 'Hedwig-我有一片芝麻地' }],
]);

async function getPage(id, ctx) {
    const url = 'https://' + `${id}` + '.hedwig.pub';
    const res = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(res.data);

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
    return result;
}

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    if (type === 0) {
        const tasks = [];
        for (const value of map.values()) {
            tasks.push(getPage(value.id, ctx));
        }
        const results = await Promise.all(tasks);
        let items = [];
        results.forEach((result) => {
            items = items.concat(result);
        });
        ctx.state.data = {
            title: 'Hedwig',
            link: 'https://hedwig.pub/',
            item: items,
        };
    } else {
        const id = map.get(type).id;
        ctx.state.data = {
            title: map.get(type).title,
            link: 'https://' + `${id}` + '.hedwig.pub',
            item: await getPage(id, ctx),
        };
    }
};
