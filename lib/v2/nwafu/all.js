const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');
const { parseDate } = require('@/utils/parse-date');
const { eecsMap } = require('./utils');

module.exports = async (ctx) => {
    const { type = 'jiaowu' } = ctx.params;
    const response = await got.get(eecsMap.get(type)[0]);
    const $ = cheerio.load(response.data);
    const list = $(eecsMap.get(type)[1])
        .map((index, ele) => {
            const itemTitle = $(ele).find(eecsMap.get(type)[2]).text();
            const itemPubDate = parseDate($(ele).find('span').text(), 'YYYY/MM/DD');
            const link = new URL($(ele).find(eecsMap.get(type)[2]).attr('href'), eecsMap.get(type)[0]);

            return {
                title: itemTitle,
                pubDate: itemPubDate,
                link: link.toString(),
            };
        })
        .get();

        const out = await Promise.all(
            list.map(async (item) => {
                const cache = await ctx.cache.get(item.link);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const detail_response = await got.get(item.link);
                const $ = cheerio.load(detail_response.data);
                item.description = $(eecsMap.get(type)[3]).html();
                ctx.cache.set(item.link, JSON.stringify(item));
                return item;
            })
        );

    ctx.state.data = {
        title: eecsMap.get(type)[4],
        link: eecsMap.get(type)[0],
        description: eecsMap.get(type)[4],
        item: out,
    };
};
